import * as electron from "electron";
import { Tray, BrowserWindow, shell, nativeImage } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as url from "url";
import * as os from "os";
import * as winston from "winston";

// PKI
import * as asn1js from "asn1js";
const pkijs = require("pkijs");

import * as ssl from "./ssl";

const TMP_DIR = os.homedir();
const APP_TMP_DIR = path.join(TMP_DIR, ".fortify");
if (!fs.existsSync(APP_TMP_DIR)) {
    fs.mkdirSync(APP_TMP_DIR);
}
const APP_LOG_FILE = path.join(APP_TMP_DIR, `LOG.log`);
const APP_CONFIG_FILE = path.join(APP_TMP_DIR, `config.json`);
const APP_SSL_CERT_CA = path.join(APP_TMP_DIR, `ca.pem`);
const APP_SSL_CERT = path.join(APP_TMP_DIR, `cert.pem`);
const APP_SSL_OLD_CERT = path.join(APP_TMP_DIR, `old_ca.pem`);
const APP_SSL_KEY = path.join(APP_TMP_DIR, `key.pem`);

interface IConfigure {
    logging?: boolean;
}

function ConfigureRead(path: string) {
    let res: IConfigure;
    if (!fs.existsSync(path)) {
        // Create config with default data
        res = {};
        ConfigureWrite(APP_CONFIG_FILE, res);
    } else {
        const json = fs.readFileSync(APP_CONFIG_FILE, "utf8");
        res = JSON.parse(json);
    }
    return res;
}
function ConfigureWrite(path: string, config: IConfigure) {
    const json = JSON.stringify(config, null, "  ");
    fs.writeFileSync(path, json, { flag: "w+" });
}
winston.clear();
function LoggingSwitch(enabled: boolean) {
    if (enabled) {
        const options = { flag: "w+" };
        if (!fs.existsSync(APP_LOG_FILE)) {
            fs.writeFileSync(APP_LOG_FILE, "", options);
        }
        winston.add(winston.transports.File, { filename: APP_LOG_FILE, options: options });
    } else {
        winston.clear();
    }
}

const configure = ConfigureRead(APP_CONFIG_FILE);
LoggingSwitch(configure.logging!);

winston.info(`Application started at ${new Date()}`);

const { app, Menu, MenuItem } = electron;
if ("dock" in app) {
    app.dock.hide();
}

let tray: Electron.Tray;

const icons = {
    tray: os.platform() === "win32" ? path.join(__dirname, "..", "icons/favicon-32x32.png") : path.join(__dirname, "..", "icons/tray/icon.png"),
    trayWhite: path.join(__dirname, "..", "icons/tray/icon_pressed.png"),
    favicon: path.join(__dirname, "..", "icons/favicon-32x32.png"),
};

const htmls = {
    index: path.join(__dirname, "..", 'htmls/index.html'),
    keyPin: path.join(__dirname, "..", 'htmls/2key-pin.html'),
    pkcsPin: path.join(__dirname, "..", 'htmls/pkcs11-pin.html'),
    about: path.join(__dirname, "..", 'htmls/about.html'),
    manage: path.join(__dirname, "..", 'htmls/manage.html'),
    message_error: path.join(__dirname, "..", 'htmls/message_error.html'),
    message_warn: path.join(__dirname, "..", 'htmls/message_warn.html'),
};

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
    winston.info(`Someone tried to run a second instance`);
});

if (isSecondInstance) {
    winston.info(`Close second instance`);
    app.quit();
}

app.on("ready", () => {
    (async () => {
        tray = new Tray(icons.tray);
        const trayIconPressed = nativeImage.createFromPath(icons.trayWhite);
        tray.setPressedImage(trayIconPressed);

        const contextMenu = new Menu();

        const menuManage = new MenuItem({
            label: "Manage"
        });
        menuManage.click = () => {
            CreateManageWindow();
        };

        const menuAbout = new MenuItem({
            label: "About"
        });
        menuAbout.click = () => {
            CreateAboutWindow();
        };

        const menuLogSubMenu = new Menu();
        const menuLogView = new MenuItem({
            label: "View log",
            enabled: !!configure.logging,
        });
        menuLogView.click = () => {
            shell.openItem(APP_LOG_FILE);
        };
        const menuLogDisable = new MenuItem({
            label: "Enable/Disable",
            type: "checkbox",
            checked: !!configure.logging
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
            label: "Logging",
            submenu: menuLogSubMenu,
        });

        const menuTools = new MenuItem({
            label: "Tools",
        });
        menuTools.click = () => {
            shell.openExternal("https://peculiarventures.github.io/webcrypto-local");
        };

        const menuSeparator = new MenuItem({
            type: "separator"
        });

        const menuExit = new MenuItem({
            label: "Exit"
        });

        menuExit.click = () => {
            app.exit();
        };

        // contextMenu.append(menuManage);
        contextMenu.append(menuAbout);
        contextMenu.append(menuLog);
        contextMenu.append(menuTools);
        contextMenu.append(menuSeparator);
        contextMenu.append(menuExit);

        tray.setToolTip(`Fortify`);
        tray.setContextMenu(contextMenu);

        CreateWindow();
        await StartService();
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
let mainWindow: Electron.BrowserWindow;

function CreateWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600, show: false });

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: htmls.index,
        protocol: 'file:',
        slashes: true
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

let LocalServer: any;
let server: any;
try {
    LocalServer = require("webcrypto-local").LocalServer;
}
catch (e) {
    winston.error(e.toString());
}

function CheckSSL() {
    if (fs.existsSync(APP_SSL_CERT) && fs.existsSync(APP_SSL_KEY)) {
        const sslCert = fs.readFileSync(APP_SSL_CERT, "utf8").replace(/-{5}[\w\s]+-{5}/ig, "").replace(/\r/g, "").replace(/\n/g, "");

        // Parse cert

        const asn1 = asn1js.fromBER(new Uint8Array(new Buffer(sslCert, "base64")).buffer);
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

async function StartService() {

    let sslData;

    if (!CheckSSL()) {
        winston.info(`SSL certificate is created`);
        sslData = await ssl.generate();

        // Copy cert.pem to old_cert.pem for cert removing from key chain
        // key chain doesn't allow to rewrite certificates
        if (fs.existsSync(APP_SSL_CERT)) {
            winston.info("Copy cert.pem to old_cert.pem");
            const file = fs.readFileSync(APP_SSL_CERT);
            fs.writeFileSync(APP_SSL_OLD_CERT, file);
        }

        // write files
        fs.writeFileSync(APP_SSL_CERT_CA, sslData.root);
        fs.writeFileSync(APP_SSL_CERT, sslData.cert);
        fs.writeFileSync(APP_SSL_KEY, sslData.key);

        // Set cert as trusted
        const warning = new Promise((resolve, reject) => { // wrap callback
            CreateWarningWindow("We need to make the Fortify SSL certificate trusted. When we do this you will be asked for your administrator password.", () => {
                winston.info("Window closed 1");
                resolve();
            });
        })
            .then(() => {
                winston.info("Installing SSL certificate");
                return ssl.InstallTrustedCertificate(APP_SSL_CERT_CA)
            })
            .catch((err: Error) => {
                winston.error(err as any);
                // remove ssl files if installation is fail
                fs.unlinkSync(APP_SSL_CERT_CA);
                fs.unlinkSync(APP_SSL_CERT);
                fs.unlinkSync(APP_SSL_KEY);

                CreateErrorWindow("Unable to install the SSL certificate for Fortify as a trusted root certificate. The application will not work until this is resolved.", () => {
                    app.quit();
                })
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

    server.listen("127.0.0.1:31337")
        .on("listening", (e: any) => {
            winston.info(`Server: Started at ${e}`);
        })
        .on("info", (message: string) => {
            winston.info(message);
        })
        .on("error", (e: Error) => {
            winston.error(e.stack || e.toString());
        })
        .on("notify", (p: any) => {
            const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

            switch (p.type) {
                case "2key": {
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
                        slashes: true
                    }));

                    (window as any).params = p;
                    p.accept = false;

                    window.on("closed", () => {
                        p.resolve(p.accept);
                    });
                    break;
                }
                case "pin": {
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

                    // and load the index.html of the app.
                    window.loadURL(url.format({
                        pathname: htmls.pkcsPin,
                        protocol: 'file:',
                        slashes: true
                    }));

                    (window as any).params = p;
                    p.pin = "";

                    window.on("closed", () => {
                        p.resolve(p.pin);
                    });
                    break;
                }
                default:
                    throw new Error("Unknown Notify param");
            }
        })
        .on("disconnect", (e: any) => {
            winston.info(`Close: ${e}`);
        });
}

let aboutWindow: Electron.BrowserWindow | null = null;
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
        title: "About",
        icon: icons.favicon,
    });

    // and load the index.html of the app.
    aboutWindow.loadURL(url.format({
        pathname: htmls.about,
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    aboutWindow.on('closed', function () {
        aboutWindow = null
    });
}

let manageWindow: Electron.BrowserWindow | null = null;
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
        title: "Manage",
        icon: icons.favicon,
    });

    // and load the index.html of the app.
    manageWindow.loadURL(url.format({
        pathname: htmls.manage,
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    manageWindow.on('closed', function () {
        manageWindow = null
    });
}

let errorWindow: Electron.BrowserWindow | null = null;
function CreateErrorWindow(text: string, cb?: Function) {
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
        title: "Error",
        icon: icons.favicon,
    });

    // and load the index.html of the app.
    errorWindow.loadURL(url.format({
        pathname: htmls.message_error,
        protocol: 'file:',
        slashes: true
    }));

    (errorWindow as any).params = {
        text
    };

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    errorWindow.on('closed', function () {
        errorWindow = null
        cb && cb();
    });
}

let warnWindow: Electron.BrowserWindow | null = null;
function CreateWarningWindow(text: string, cb?: Function) {
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
        title: "Warning",
        icon: icons.favicon,
    });

    // and load the index.html of the app.
    warnWindow.loadURL(url.format({
        pathname: htmls.message_warn,
        protocol: 'file:',
        slashes: true
    }));

    (warnWindow as any).params = {
        text
    };

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    warnWindow.on('closed', function () {
        warnWindow = null
        cb && cb();
    });
}