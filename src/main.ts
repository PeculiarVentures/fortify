import * as electron from "electron";
import { Tray, BrowserWindow, shell } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as url from "url";
import * as os from "os";
import * as winston from "winston";

const { LocalServer } = require("webcrypto-local");

const TMP_DIR = os.tmpdir();
const APP_TMP_DIR = path.join(TMP_DIR, ".fortify");
if (!fs.existsSync(APP_TMP_DIR)) {
    fs.mkdirSync(APP_TMP_DIR);
}
const APP_LOG_FILE = path.join(APP_TMP_DIR, `log-${new Date().toDateString()}.log`);
winston.add(winston.transports.File, { filename: APP_LOG_FILE });

const { app, Menu, MenuItem } = electron;
if ("dock" in app) {
    app.dock.hide();
}

let tray: Electron.Tray;

app.on("ready", () => {
    (async () => {
        tray = new Tray(path.join(__dirname, "..", "favicon-16x16.png"));
        const contextMenu = new Menu();

        const menuManage = new MenuItem({
            label: "Manage"
        });
        menuManage.click = () => {
            CreateManageWindow();
        }

        const menuAbout = new MenuItem({
            label: "About"
        });
        menuAbout.click = () => {
            CreateAboutWindow();
        }

        const menuLog = new MenuItem({
            label: "Log"
        });
        menuLog.click = () => {
            shell.openItem(APP_LOG_FILE);
        }

        const menuSeparator = new MenuItem({
            type: "separator"
        });

        const menuExit = new MenuItem({
            label: "Exit"
        });

        menuExit.click = () => {
            app.exit();
        }

        // contextMenu.append(menuManage);
        contextMenu.append(menuAbout);
        contextMenu.append(menuLog);
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
        })

})

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
        pathname: path.join(__dirname, "..", 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // mainWindow = null
    })
}

const server = new LocalServer();

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
                        icon: path.join(__dirname, "..", "tray_icon.png"),
                    });

                    // and load the index.html of the app.
                    window.loadURL(url.format({
                        pathname: path.join(__dirname, "..", '2key-pin.html'),
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
                        width: 400,
                        height: 400,
                        alwaysOnTop: true,
                        autoHideMenuBar: true,
                        resizable: false,
                        minimizable: false,
                        icon: path.join(__dirname, "..", "favicon-32x32.png")
                    });

                    // and load the index.html of the app.
                    window.loadURL(url.format({
                        pathname: path.join(__dirname, "..", 'pkcs11-pin.html'),
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

let aboutWindow: Electron.BrowserWindow | null = null
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
        icon: path.join(__dirname, "..", "favicon-32x32.png")
    });

    // and load the index.html of the app.
    aboutWindow.loadURL(url.format({
        pathname: path.join(__dirname, "..", 'about.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    aboutWindow.on('closed', function () {
        aboutWindow = null
    })
}

let manageWindow: Electron.BrowserWindow | null = null
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
        icon: path.join(__dirname, "..", "tray_icon.png")
    });

    // and load the index.html of the app.
    manageWindow.loadURL(url.format({
        pathname: path.join(__dirname, "..", 'manage.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    manageWindow.on('closed', function () {
        manageWindow = null
    })
}