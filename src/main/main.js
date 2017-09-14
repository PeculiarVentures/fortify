/// <reference path="./types.d.ts" />
// @ts-check

// @ts-ignore
import { Tray, BrowserWindow, shell, nativeImage, screen, app, Menu, MenuItem, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as os from 'os';
import * as semver from 'semver';
import * as winston from 'winston';
// PKI
import * as asn1js from 'asn1js';
// @ts-ignore
import * as pkijs from 'pkijs';
import * as ssl from './ssl.js';
import {
  APP_TMP_DIR, APP_LOG_FILE, APP_CONFIG_FILE, APP_SSL_CERT, APP_SSL_KEY, APP_SSL_CERT_CA,
  ICON_DIR, HTML_DIR, CHECK_UPDATE, CHECK_UPDATE_INTERVAL, APP_DIR, DOWNLOAD_LINK,
} from './const';
import { ConfigureRead, ConfigureWrite } from './config';
import { GetUpdateInfo } from './update';

if (!fs.existsSync(APP_TMP_DIR)) {
  fs.mkdirSync(APP_TMP_DIR);
}

winston.clear();

/**
 * Turn on/of logger
 * 
 * @param {boolean} enabled 
 */
function LoggingSwitch(enabled) {
  if (enabled) {
    const options = { flag: 'w+' };
    if (!fs.existsSync(APP_LOG_FILE)) {
      fs.writeFileSync(APP_LOG_FILE, '', options);
    }
    winston.add(winston.transports.File, { filename: APP_LOG_FILE, options: options });
  } else {
    winston.clear();
  }
}

const configure = ConfigureRead(APP_CONFIG_FILE);
LoggingSwitch(configure.logging);

winston.info(`Application started at ${new Date()}`);

// const { app, Menu, MenuItem } = electron;
if ('dock' in app) {
  app.dock.hide();
}

let tray;

const icons = {
  tray: os.platform() === 'win32' ? path.join(ICON_DIR, 'favicon-32x32.png') : path.join(ICON_DIR, 'tray', 'icon.png'),
  trayWhite: path.join(ICON_DIR, 'tray', 'icon_pressed.png'),
  favicon: path.join(ICON_DIR, 'favicon-32x32.png'),
};

const htmls = {
  index: path.join(HTML_DIR, 'index.html'),
  keyPin: path.join(HTML_DIR, '2key-pin.html'),
  pkcsPin: path.join(HTML_DIR, 'pkcs11-pin.html'),
  about: path.join(HTML_DIR, 'about.html'),
  manage: path.join(HTML_DIR, 'manage.html'),
  message_question: path.join(HTML_DIR, 'message_question.html'),
  message_error: path.join(HTML_DIR, 'message_error.html'),
  message_warn: path.join(HTML_DIR, 'message_warn.html'),
  keys: path.join(HTML_DIR, 'keys.html'),
};

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  winston.info(`Someone tried to run a second instance`);
});

if (isSecondInstance) {
  winston.info(`Close second instance`);
  app.quit();
}

app.on('ready', () => {
  (async () => {
    tray = new Tray(icons.tray);
    const trayIconPressed = nativeImage.createFromPath(icons.trayWhite);
    tray.setPressedImage(trayIconPressed);

    const contextMenu = new Menu();

    const menuManage = new MenuItem({
      label: 'Manage',
    });
    menuManage.click = () => {
      CreateManageWindow();
    };

    const menuAbout = new MenuItem({
      label: 'About',
    });
    menuAbout.click = () => {
      CreateAboutWindow();
    };

    const menuKeys = new MenuItem({
      label: 'Sites',
    });
    menuKeys.click = () => {
      CreateKeysWindow();
    };

    const menuLogSubMenu = new Menu();
    const menuLogView = new MenuItem({
      label: 'View log',
      enabled: !!configure.logging,
    });
    menuLogView.click = () => {
      shell.openItem(APP_LOG_FILE);
    };
    const menuLogDisable = new MenuItem({
      label: 'Enable/Disable',
      type: 'checkbox',
      checked: !!configure.logging,
    });

    menuLogDisable.click = () => {
      configure.logging = !configure.logging;
      menuLogDisable.checked = configure.logging;
      menuLogView.enabled = configure.logging;
      ConfigureWrite(APP_CONFIG_FILE, configure);
      LoggingSwitch(configure.logging);
    };
    menuLogSubMenu.append(menuLogView);
    menuLogSubMenu.append(menuLogDisable);
    const menuLog = new MenuItem({
      label: 'Logging',
      submenu: menuLogSubMenu,
    });

    const menuTools = new MenuItem({
      label: 'Tools',
    });
    menuTools.click = () => {
      shell.openExternal('https://peculiarventures.github.io/fortify-web');
    };

    const menuSeparator = new MenuItem({
      type: 'separator',
    });

    const menuExit = new MenuItem({
      label: 'Exit',
    });

    menuExit.click = () => {
      app.exit();
    };

    // contextMenu.append(menuManage);
    contextMenu.append(menuAbout);
    contextMenu.append(menuKeys);
    contextMenu.append(menuLog);
    contextMenu.append(menuTools);
    contextMenu.append(menuSeparator);
    contextMenu.append(menuExit);

    tray.setToolTip(`Fortify`);
    tray.setContextMenu(contextMenu);

    CreateWindow();
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
      app.emit('error', err);
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

function CreateWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600, show: false });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: htmls.index,
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // mainWindow = null
  });
}

let LocalServer;
/** @type {WebCryptoLocal.LocalServer} */
let server;
try {
  // @ts-ignore
  LocalServer = require('webcrypto-local').LocalServer;
} catch (e) {
  winston.error(e.toString());
}

function CheckSSL() {
  if (fs.existsSync(APP_SSL_CERT) && fs.existsSync(APP_SSL_KEY)) {
    const sslCert = fs.readFileSync(APP_SSL_CERT, 'utf8').replace(/-{5}[\w\s]+-{5}/ig, '').replace(/\r/g, '').replace(/\n/g, '');

    // Parse cert

    const asn1 = asn1js.fromBER(new Uint8Array(Buffer.from(sslCert, 'base64')).buffer);
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
  let sslData;

  if (!CheckSSL()) {
    winston.info(`SSL certificate is created`);
    sslData = await ssl.generate();

    // write files
    fs.writeFileSync(APP_SSL_CERT_CA, sslData.root);
    fs.writeFileSync(APP_SSL_CERT, sslData.cert);
    fs.writeFileSync(APP_SSL_KEY, sslData.key);

    // Set cert as trusted
    const warning = new Promise((resolve, reject) => { // wrap callback
      CreateWarningWindow('We need to make the Fortify SSL certificate trusted. When we do this you will be asked for your administrator password.', () => {
        winston.info('Warning window was closed');
        resolve();
      });
    })
      .then(() => {
        winston.info('Installing SSL certificate');
        return ssl.InstallTrustedCertificate(APP_SSL_CERT_CA);
      })
      .catch((err) => {
        winston.error(err.toString());
        // remove ssl files if installation is fail
        fs.unlinkSync(APP_SSL_CERT_CA);
        fs.unlinkSync(APP_SSL_CERT);
        fs.unlinkSync(APP_SSL_KEY);

        CreateErrorWindow('Unable to install the SSL certificate for Fortify as a trusted root certificate. The application will not work until this is resolved.', () => {
          app.quit();
        });
      });
    await warning;
  } else {
    // read files
    sslData = {
      cert: fs.readFileSync(APP_SSL_CERT),
      key: fs.readFileSync(APP_SSL_KEY),
    };
    winston.info(`SSL certificate is loaded`);
  }

  server = new LocalServer(sslData);

  server.listen('127.0.0.1:31337')
    .on('listening', (e) => {
      winston.info(`Server: Started at ${e}`);
    })
    .on('info', (message) => {
      winston.info(message);
    })
    .on('error', (e) => {
      winston.error(e.stack || e.toString());
    })
    .on('notify', (p) => {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;

      switch (p.type) {
        case '2key': {
          // Create the browser window.
          const window = new BrowserWindow({
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
          });

          // and load the index.html of the app.
          window.loadURL(url.format({
            pathname: htmls.keyPin,
            protocol: 'file:',
            slashes: true,
          }));

          // @ts-ignore
          window.params = p;
          p.accept = false;

          window.on('closed', () => {
            p.resolve(p.accept);
          });
          break;
        }
        case 'pin': {
          // Create the browser window.
          const window = new BrowserWindow({
            width: 500,
            height: 400,
            alwaysOnTop: true,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            icon: icons.favicon,
          });

          console.log(p);

          // and load the index.html of the app.
          window.loadURL(url.format({
            pathname: htmls.pkcsPin,
            protocol: 'file:',
            slashes: true,
          }));

          // @ts-ignore
          window.params = p;
          p.pin = '';

          window.on('closed', () => {
            p.resolve(p.pin);
          });
          break;
        }
        default:
          throw new Error('Unknown Notify param');
      }
    })
    .on('close', (e) => {
      winston.info(`Close: ${e}`);
    });
}

let aboutWindow = null;
function CreateAboutWindow() {
  // Create the browser window.
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }
  aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    autoHideMenuBar: true,
    minimizable: false,
    resizable: false,
    title: 'About',
    icon: icons.favicon,
  });

  // and load the index.html of the app.
  aboutWindow.loadURL(url.format({
    pathname: htmls.about,
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  aboutWindow.on('closed', function () {
    aboutWindow = null;
  });
}

let manageWindow = null;
function CreateManageWindow() {
  // Create the browser window.
  if (manageWindow) {
    return;
  }
  manageWindow = new BrowserWindow({
    width: 600,
    height: 500,
    autoHideMenuBar: true,
    minimizable: false,
    resizable: false,
    title: 'Manage',
    icon: icons.favicon,
  });

  // and load the index.html of the app.
  manageWindow.loadURL(url.format({
    pathname: htmls.manage,
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  manageWindow.on('closed', function () {
    manageWindow = null;
  });
}

let errorWindow = null;
/**
 * Creates Error window
 * 
 * @param {string}      text    Message text
 * @param {Function}    [cb]    Callback on message close 
 * @returns 
 */
function CreateErrorWindow(text, cb) {
  // Create the browser window.
  if (errorWindow) {
    errorWindow.show();
    return;
  }
  errorWindow = new BrowserWindow({
    width: 500,
    height: 300,
    autoHideMenuBar: true,
    minimizable: false,
    fullscreenable: false,
    resizable: false,
    title: 'Error',
    icon: icons.favicon,
  });

  // and load the index.html of the app.
  errorWindow.loadURL(url.format({
    pathname: htmls.message_error,
    protocol: 'file:',
    slashes: true,
  }));

  // @ts-ignore
  errorWindow.params = {
    text,
  };

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  errorWindow.on('closed', function () {
    errorWindow = null;
    cb && cb();
  });
}

let warnWindow = null;
/**
 * Creates Warning window
 * 
 * @param {string}      text    Message text
 * @param {Function}    [cb]    Callback on message close 
 * @returns 
 */
function CreateWarningWindow(text, cb) {
  // Create the browser window.
  if (warnWindow) {
    warnWindow.show();
    return;
  }
  warnWindow = new BrowserWindow({
    width: 500,
    height: 300,
    autoHideMenuBar: true,
    minimizable: false,
    fullscreenable: false,
    resizable: false,
    title: 'Warning',
    icon: icons.favicon,
  });

  // and load the index.html of the app.
  warnWindow.loadURL(url.format({
    pathname: htmls.message_warn,
    protocol: 'file:',
    slashes: true,
  }));

  // @ts-ignore
  warnWindow.params = {
    text,
  };

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  warnWindow.on('closed', function () {
    warnWindow = null;
    cb && cb();
  });
}

let keysWindow = null;
function CreateKeysWindow() {
  // Create the browser window.
  if (keysWindow) {
    keysWindow.focus();
    return;
  }
  keysWindow = new BrowserWindow({
    width: 600,
    height: 500,
    autoHideMenuBar: true,
    minimizable: false,
    resizable: false,
    title: 'Sites',
    icon: icons.favicon,
  });

  // and load the index.html of the app.
  keysWindow.loadURL(url.format({
    pathname: htmls.keys,
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  keysWindow.on('closed', function () {
    keysWindow = null;
  });
}

function InitMessages() {
  ipcMain.on('2key-list', (event, arg) => {
    Promise.resolve()
      .then(() => {
        const storage = server.server.storage;
        if (!Object.keys(storage.remoteIdentities).length) {
          // NOTE: call protected method of the storage
          // @ts-ignore
          return storage.loadRemote();
        }
      })
      .then(() => {
        const identities = server.server.storage.remoteIdentities;
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
        const res = [];
        let currentIdentity = {
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
            if (currentIdentity.created > identity.created) {
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
        event.sender.send('2key-list', res);
      });
  })
    .on('2key-remove', (event, arg) => {
      const storage = server.server.storage;
      CreateQuestionWindow(`Do you want to remove ${arg} from the trusted list?`, { parent: keysWindow }, (result) => {
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
          event.sender.send('2key-remove', arg);
        }
      });
    })
    .on('error', (error) => {
      winston.error(error.toString());
    });
}

/**
 * @typedef {Object} Identity
 * @property {string}   [browser]
 * @property {Date}     [created]
 * @property {string}   [id]
 * @property {string|'edge'|'ie'|'chrome'|'safari'|'firefox'|'other'}   [origin]
 */

/**
 * 
 * @param {WebCryptoLocal.RemoteIdentityEx} identity 
 */
function PrepareIdentity(identity) {
  const userAgent = identity.userAgent;
  /** @type {Identity} */
  let res = {};
  // eslint-disable-next-line
  let reg;
  // eslint-disable-next-line
  if (reg = /edge\/([\d\.]+)/i.exec(userAgent)) {
    res.browser = 'edge';
  } else if (/msie/i.test(userAgent)) {
    res.browser = 'ie';
  } else if (/Trident/i.test(userAgent)) {
    res.browser = 'ie';
  } else if (/chrome/i.test(userAgent)) {
    res.browser = 'chrome';
  } else if (/safari/i.test(userAgent)) {
    res.browser = 'safari';
  } else if (/firefox/i.test(userAgent)) {
    res.browser = 'firefox';
  } else {
    res.browser = 'Other';
  }
  res.created = identity.createdAt;
  res.origin = identity.origin;
  return res;
}

/**
 * @typedef {Object} ModalWindowOptions
 * @property {BrowserWindow}    [parent]
 * @property {string}           [title]
 */

/**
 * 
 * @param {string}              text 
 * @param {ModalWindowOptions}  options 
 * @param {Function}            cb
 * @return {BrowserWindow}
 */
function CreateQuestionWindow(text, options, cb) {
  // Create the browser window.
  const errorWindow = new BrowserWindow({
    width: 500,
    height: 300,
    autoHideMenuBar: true,
    minimizable: false,
    fullscreenable: false,
    resizable: false,
    title: 'Question',
    icon: icons.favicon,
    modal: !!options.parent,
    parent: options.parent,
  });

  // and load the index.html of the app.
  errorWindow.loadURL(url.format({
    pathname: htmls.message_question,
    protocol: 'file:',
    slashes: true,
  }));

  // @ts-ignore
  errorWindow.params = {
    text,
    result: 0,
  };

  // Emitted when the window is closed.
  errorWindow.on('closed', function () {
    // @ts-ignore
    cb && cb(errorWindow.params.result);
  });

  return errorWindow;
}

async function CheckUpdate() {
  try {
    const update = await GetUpdateInfo();
    // get current version
    const packageJson = fs.readFileSync(path.join(APP_DIR, 'package.json')).toString();
    const curVersion = JSON.parse(packageJson).version;

    // compare versions
    if (semver.lt(curVersion, update.version)) {
      await new Promise((resolve, reject) => {
        CreateQuestionWindow(`New update is available. Do you want to download version ${update.version} now?`, {}, (res) => {
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
            CreateErrorWindow(`Application cannot be started until new update will be applied`, () => {
              winston.info(`Close application`);
              app.quit();
            });
          } else {
            resolve();
          }
        });
      });
    }
  } catch (e) {
    winston.error(e.toString());
    await new Promise((resolve, reject) => {
      CreateErrorWindow(e.toString(), () => {
        app.quit();
      });
    });
  }
}
