import * as electron from "electron";
import { Tray, BrowserWindow, shell, nativeImage } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as url from "url";
import * as os from "os";
import * as winston from "winston";

const TMP_DIR = os.tmpdir();
const APP_TMP_DIR = path.join(TMP_DIR, ".fortify");
if (!fs.existsSync(APP_TMP_DIR)) {
    fs.mkdirSync(APP_TMP_DIR);
}
const APP_LOG_FILE = path.join(APP_TMP_DIR, `LOG.log`);
const APP_CONFIG_FILE = path.join(APP_TMP_DIR, `config.json`);

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
        winston.add(winston.transports.File, { filename: APP_LOG_FILE, options: { flags: "w+" } });
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
            enabled: configure.logging,
        });
        menuLogView.click = () => {
            shell.openItem(APP_LOG_FILE);
        };
        const menuLogDisable = new MenuItem({
            label: "On/Off",
            type: "checkbox",
            checked: configure.logging
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

        StartService();
        CreateWindow();
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
    server = new LocalServer();
}
catch (e) {
    winston.error(e.toString());
}

function StartService() {

    server.listen("localhost:8080")
        .on("listening", (e: any) => {
            winston.info(`Server: Started at ${e}`);
        })
        .on("info", (message: string) => {
            winston.info(message);
        })
        .on("error", (e: Error) => {
            winston.info(e.toString());
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