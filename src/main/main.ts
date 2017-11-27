import { app, ipcMain, Menu, MenuItem, nativeImage, screen, shell, Tray } from "electron";

import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as querystring from "querystring";
import * as url from "url";

import * as request from "request";
import * as semver from "semver";
import * as winston from "winston";

import * as WebCryptoLocal from "webcrypto-local";

// PKI
import * as asn1js from "asn1js";
const pkijs = require("pkijs");

import * as application from "./application";
import { ConfigureRead, ConfigureWrite } from "./config";
import {
  APP_CARD_JSON, APP_CARD_JSON_LINK, APP_CONFIG_FILE, APP_DIR, APP_LOG_FILE, APP_SSL_CERT,
  APP_SSL_CERT_CA, APP_SSL_KEY, APP_TMP_DIR, CHECK_UPDATE, CHECK_UPDATE_INTERVAL,
  DOWNLOAD_LINK, HTML_DIR, ICON_DIR, icons, TEMPLATE_NEW_CARD_FILE,
} from "./const";
import * as jws from "./jws";
import { Locale, locale, t } from "./locale";
import * as ssl from "./ssl";
import * as tray from "./tray";
import { GetUpdateInfo } from "./update";
import { CreateWindow } from "./window";
import { CreateQuestionWindow, CreateErrorWindow, CreateWarningWindow } from "./windows/message";

if (!fs.existsSync(APP_TMP_DIR)) {
  fs.mkdirSync(APP_TMP_DIR);
}

winston.clear();

winston.info(`Application started at ${new Date()}`);

// const { app, Menu, MenuItem } = electron;
if ("dock" in app) {
  app.dock.hide();
}

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  winston.info(`Someone tried to run a second instance`);
});

if (isSecondInstance) {
  winston.info(`Close second instance`);
  app.quit();
}

app.on("ready", () => {
  (async () => {

    //#region Load locale

    if (!application.configure.locale) {
      const localeList = Locale.getLangList();
      const lang = app.getLocale().split("-")[0];
      application.configure.locale = (localeList.indexOf(lang) === -1) ? "en" : lang;
      // save configure
      ConfigureWrite(APP_CONFIG_FILE, application.configure);
    }
    locale.setLang(application.configure.locale);

    locale.on("change", () => {
      application.configure.locale = locale.lang;
      ConfigureWrite(APP_CONFIG_FILE, application.configure);
    });
    //#endregion

    tray.create();

    CreateMainWindow();
    if (CHECK_UPDATE) {
      await CheckUpdate();
      setInterval(() => {
        CheckUpdate();
      }, CHECK_UPDATE_INTERVAL);
    }
    await InitService();
    InitMessages();
  })()
    .catch((err) => {
      winston.error(err.toString());
      app.emit("error", err);
    });
});

// Quit when all windows are closed.
// app.on('window-all-closed', function () {
//     // On OS X it is common for applications and their menu bar
//     // to stay active until the user quits explicitly with Cmd + Q
//     if (process.platform !== 'darwin') {
//         app.quit()
//     }
// })

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function CreateMainWindow() {
  // Create the browser window.
  mainWindow = CreateWindow({
    app: "index",
    width: 800,
    height: 600,
    show: false,
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // mainWindow = null
  });
}

function CheckSSL() {
  if (fs.existsSync(APP_SSL_CERT) && fs.existsSync(APP_SSL_KEY)) {
    const sslCert = fs.readFileSync(APP_SSL_CERT, "utf8").replace(/-{5}[\w\s]+-{5}/ig, "").replace(/\r/g, "").replace(/\n/g, "");

    // Parse cert

    const asn1 = asn1js.fromBER(new Uint8Array(Buffer.from(sslCert, "base64")).buffer);
    const cert = new pkijs.Certificate({ schema: asn1.result });

    // Check date
    if (cert.notAfter.value < new Date()) {
      winston.info(`SSL certificate is expired`);
      return false;
    }
    return true;
  }
  winston.info(`SSL certificate is not found`);
  return false;
}

async function InitService() {
  let sslData: WebCryptoLocal.IServerOptions;

  if (!CheckSSL()) {
    winston.info(`SSL certificate is created`);
    sslData = await ssl.generate() as any;

    // write files
    // fs.writeFileSync(APP_SSL_CERT_CA, sslData.root);
    fs.writeFileSync(APP_SSL_CERT, sslData.cert);
    fs.writeFileSync(APP_SSL_KEY, sslData.key);

    // Set cert as trusted
    const warning = new Promise((resolve, reject) => { // wrap callback
      CreateWarningWindow("We need to make the Fortify SSL certificate trusted. When we do this you will be asked for your administrator password.", { alwaysOnTop: true }, () => {
        winston.info("Warning window was closed");
        resolve();
      });
    })
      .then(() => {
        winston.info("Installing SSL certificate");
        return ssl.InstallTrustedCertificate(APP_SSL_CERT_CA);
      })
      .catch((err) => {
        winston.error(err.toString());
        // remove ssl files if installation is fail
        fs.unlinkSync(APP_SSL_CERT_CA);
        fs.unlinkSync(APP_SSL_CERT);
        fs.unlinkSync(APP_SSL_KEY);

        CreateErrorWindow(t("error.ssl.install"), () => {
          app.quit();
        });
      });
    await warning;
  } else {
    // read files
    sslData = {
      cert: fs.readFileSync(APP_SSL_CERT),
      key: fs.readFileSync(APP_SSL_KEY),
    } as any;
    winston.info(`SSL certificate is loaded`);
  }

  const config: IConfigure = {
    disableCardUpdate: application.configure.disableCardUpdate,
  };
  await PrepareConfig(config);
  // @ts-ignore
  sslData.config = config;

  try {
    application.load(sslData);
  } catch (e) {
    winston.error(e.message);
    winston.error("LocalServer is empty. webcrypto-local module wasn't loaded");
    return;
  }

  const server = application.server;

  server.listen("127.0.0.1:31337")
    .on("listening", (e: any) => {
      winston.info(`Server: Started at ${e}`);
    })
    .on("info", (message) => {
      winston.info(message);
    })
    .on("token_error", (message) => {
      winston.error(`Token: ${message}`);
      CreateWarningWindow(message, { alwaysOnTop: true });
    })
    .on("token_new", (card) => {
      winston.info(`New token was found reader: '${card.reader}' ATR: ${card.atr.toString("hex")}`);
      CreateQuestionWindow(t("question.new.token"), {}, (res) => {
        if (res) {
          try {
            const title = `Add support for '${card.atr.toString("hex")}' token`;
            const body = fs.readFileSync(TEMPLATE_NEW_CARD_FILE, { encoding: "utf8" })
              .replace(/\$\{reader\}/g, card.reader)
              .replace(/\$\{atr\}/g, card.atr.toString("hex").toUpperCase())
              .replace(/\$\{driver\}/g, crypto.randomBytes(20).toString("hex").toUpperCase());
            const url1 = `https://github.com/PeculiarVentures/fortify/issues/new?` + querystring.stringify({
              title,
              body,
            });
            shell.openExternal(url1);
          } catch (e) {
            winston.error(e.message);
          }
        }
      });
    })
    .on("error", (e: Error) => {
      winston.error(e.stack || e.toString());
    })
    .on("notify", (p: any) => {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;

      switch (p.type) {
        case "2key": {
          p.accept = false;

          // Create the browser window.
          const window = CreateWindow({
            app: "key-pin",
            width: 400,
            height: 300,
            x: width - 400,
            y: height - 300,
            // alwaysOnTop: true,
            resizable: false,
            minimizable: false,
            autoHideMenuBar: true,
            modal: true,
            alwaysOnTop: true,
            icon: icons.favicon,
            params: p,
          });


          window.on("closed", () => {
            p.resolve(p.accept);
          });
          break;
        }
        case "pin": {
          // Create the browser window.
          const window = CreateWindow({
            app: "pin",
            width: 500,
            height: 400,
            alwaysOnTop: true,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            icon: icons.favicon,
          });

          window.params = p;
          p.pin = "";

          window.on("closed", () => {
            if (p.pin) {
              p.resolve(p.pin);
            } else {
              p.reject(new Error("Incorrect PIN value. It cannot be empty."));
            }
          });
          break;
        }
        default:
          throw new Error("Unknown Notify param");
      }
    })
    .on("close", (e: any) => {
      winston.info(`Close: ${e}`);
    });
}

async function PrepareConfig(config: IConfigure) {
  config.cards = APP_CARD_JSON;

  if (!config.disableCardUpdate) {
    await PrepareCardJson(config);
  }
  PrepareProviders(config);
}

function PrepareProviders(config: IConfigure) {
  try {
    if (fs.existsSync(APP_CONFIG_FILE)) {
      const json = JSON.parse(fs.readFileSync(APP_CONFIG_FILE).toString());
      if (json.providers) {
        config.providers = json.providers;
      }
    }
  } catch (err) {
    winston.error(`Cannot prepare config data. ${err.stack}`);
  }
}

async function PrepareCardJson(config: IConfigure) {
  try {
    if (!fs.existsSync(APP_CARD_JSON)) {
      // try to get the latest card.json from git
      try {
        const message = await GetRemoteFile(APP_CARD_JSON_LINK);

        // try to parse
        const card = await jws.GetContent(message);

        // copy card.json to .fortify
        fs.writeFileSync(APP_CARD_JSON, JSON.stringify(card, null, "  "), { flag: "w+" });
        winston.info(`card.json was copied to .fortify from ${APP_CARD_JSON_LINK}`);

        return;
      } catch (err) {
        winston.error(`Cannot get card.json from ${APP_CARD_JSON_LINK}. ${err.stack}`);
      }

      // get original card.json from webcrypto-local
      const originalPath = path.join(APP_DIR, "node_modules", "webcrypto-local", "json", "card.json");
      if (fs.existsSync(originalPath)) {
        // copy card.json to .fortify
        const buf = fs.readFileSync(originalPath);
        fs.writeFileSync(APP_CARD_JSON, buf, { flag: "w+" });
        winston.info(`card.json was copied to .fortify from ${originalPath}`);
      } else {
        throw new Error(`Cannot find original card.json by path ${originalPath}`);
      }
    } else {
      // compare existing card.json version with remote
      // if remote version is higher then upload and remove local file
      winston.info(`Comparing current version of card.json file with remote`);

      let remote: any;
      let local: any;

      try {
        const jwsString = await GetRemoteFile(APP_CARD_JSON_LINK);
        remote = await jws.GetContent(jwsString);
      } catch (e) {
        winston.error(`Cannot get get file ${APP_CARD_JSON_LINK}. ${e.message}`);
      }

      local = JSON.parse(
        fs.readFileSync(APP_CARD_JSON, { encoding: "utf8" }),
      );

      if (remote && semver.lt(local.version || "0.0.0", remote.version || "0.0.0")) {
        // copy card.json to .fortify
        fs.writeFileSync(APP_CARD_JSON, JSON.stringify(remote, null, "  "), { flag: "w+" });
        winston.info(`card.json was copied to .fortify from ${APP_CARD_JSON_LINK}`);
      } else {
        winston.info(`card.json has the latest version`);
      }
    }
  } catch (err) {
    winston.error(`Cannot prepare card.json data. ${err.stack}`);
  }
}

async function GetRemoteFile(link: string, encoding = "utf8") {
  return new Promise<string>((resolve, reject) => {
    request.get(link, {
      encoding,
    }, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

async function CheckUpdate() {
  try {
    winston.info("Update: Check for new update");
    const update = await GetUpdateInfo();
    // get current version
    const packageJson = fs.readFileSync(path.join(APP_DIR, "package.json")).toString();
    const curVersion = JSON.parse(packageJson).version;

    // compare versions
    if (semver.lt(curVersion, update.version)) {
      winston.info("Update: New version was found");
      await new Promise((resolve, reject) => {
        CreateQuestionWindow(`A new update is available. Do you want to download version ${update.version} now?`, {}, (res) => {
          if (res) {
            // yes
            winston.info(`User agreed to download new version ${update.version}`);
            shell.openExternal(DOWNLOAD_LINK);
          } else {
            // no
            winston.info(`User refused to download new version ${update.version}`);
          }
          if (update.min && semver.lt(curVersion, update.min)) {
            winston.info(`Update ${update.version} is critical. App is not matching to minimal criteria`);
            CreateErrorWindow(t("error.critical.update"), () => {
              winston.info(`Close application`);
              app.quit();
            });
          } else {
            resolve();
          }
        });
      });
    } else {
      winston.info("Update: New version wasn't found");
    }
  } catch (e) {
    winston.error(e.toString());
    if (e.type === "UpdateError" && !e.critical) {
      // await new Promise((resolve, reject) => {
      //   CreateWarningWindow(``, () => {
      //     resolve();
      //   });
      // });
    } else {
      await new Promise((resolve, reject) => {
        CreateErrorWindow(e.toString(), () => {
          app.quit();
        });
      });
    }
  }
}

interface CurrentIdentity {
  origin: string | null;
  created: Date | null;
  browsers: string[];
}

function InitMessages() {
  ipcMain.on("2key-list", (event: any, arg: any) => {
    Promise.resolve()
      .then(() => {
        const storage = application.server.server.storage;
        if (!Object.keys(storage.remoteIdentities).length) {
          // NOTE: call protected method of the storage
          // @ts-ignore
          return storage.loadRemote();
        }
      })
      .then(() => {
        const identities = application.server.server.storage.remoteIdentities;
        const preparedList = [];
        for (const i in identities) {
          const identity = PrepareIdentity(identities[i]);
          preparedList.push(identity);
        }
        // sort identities
        preparedList.sort((a, b) => {
          if (a.origin > b.origin) {
            return 1;
          } else if (a.origin < b.origin) {
            return -1;
          } else {
            if (a.browser > b.browser) {
              return 1;
            } else if (a.browser < b.browser) {
              return -1;
            }
            return 0;
          }
        });
        // prepare data
        const res: CurrentIdentity[] = [];
        let currentIdentity: CurrentIdentity = {
          origin: null,
          created: null,
          browsers: [],
        };
        preparedList.forEach((identity) => {
          if (currentIdentity.origin !== identity.origin) {
            if (currentIdentity.origin !== null) {
              res.push(currentIdentity);
            }
            currentIdentity = {
              origin: identity.origin,
              created: identity.created,
              browsers: [identity.browser],
            };
          } else {
            if (currentIdentity.created! > identity.created) {
              currentIdentity.created = identity.created;
            }
            if (!currentIdentity.browsers.some((browser) => browser === identity.browser)) {
              currentIdentity.browsers.push(identity.browser);
            }
          }
        });
        if (currentIdentity.origin !== null) {
          res.push(currentIdentity);
        }
        event.sender.send("2key-list", res);
      });
  })
    .on("2key-remove", (event: any, arg: any) => {
      const storage = application.server.server.storage;
      CreateQuestionWindow(`Do you want to remove ${arg} from the trusted list?`, { parent: application.windows.keys }, (result) => {
        if (result) {
          winston.info(`Removing 2key session key ${arg}`);
          const remList = [];
          for (const i in storage.remoteIdentities) {
            const identity = storage.remoteIdentities[i];
            if (identity.origin === arg) {
              remList.push(i);
            }
          }
          remList.forEach((item) => {
            delete storage.remoteIdentities[item];
          });
          storage.removeRemoteIdentity(arg);
          event.sender.send("2key-remove", arg);
        }
      });
    })
    .on("error", (error: Error) => {
      winston.error(error.toString());
    });
}

interface Identity {
  browser: string;
  userAgent: string;
  created: Date;
  id: string;
  origin: string | "edge" | "ie" | "chrome" | "safari" | "firefox" | "other";
}

/**
 *
 * @param {WebCryptoLocal.RemoteIdentityEx} identity
 */
function PrepareIdentity(identity: WebCryptoLocal.RemoteIdentityEx) {
  const userAgent = identity.userAgent!;
  /** @type {Identity} */
  const res: Identity = {} as any;
  // eslint-disable-next-line
  let reg: RegExpExecArray | null;
  // eslint-disable-next-line
  if (reg = /edge\/([\d\.]+)/i.exec(userAgent)) {
    res.browser = "edge";
  } else if (/msie/i.test(userAgent)) {
    res.browser = "ie";
  } else if (/Trident/i.test(userAgent)) {
    res.browser = "ie";
  } else if (/chrome/i.test(userAgent)) {
    res.browser = "chrome";
  } else if (/safari/i.test(userAgent)) {
    res.browser = "safari";
  } else if (/firefox/i.test(userAgent)) {
    res.browser = "firefox";
  } else {
    res.browser = "Other";
  }
  res.created = identity.createdAt;
  res.origin = identity.origin!;
  return res;
}
