import * as electron from "electron";
import { Tray, BrowserWindow } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as url from "url";
import * as os from "os";

const { LocalServer } = require("webcrypto-local");

const TMP_DIR = os.tmpdir();
const APP_TMP_DIR = path.join(TMP_DIR, ".fortify");
if (!fs.existsSync(APP_TMP_DIR)) {
    fs.mkdirSync(APP_TMP_DIR);
}
const APP_LOG_FILE = path.join(APP_TMP_DIR, `log-${new Date().toISOString()}.log`);
const logStream = fs.createWriteStream(APP_LOG_FILE);

const stdout_write = process.stdout.write;
const stderr_write = process.stderr.write;

// Wrap write function for stdout
function writeStdout(buffer: Buffer | string, cb?: Function): boolean;
function writeStdout(str: string, encoding?: string, cb?: Function): boolean;
function writeStdout(this: any, str: Buffer | string, encoding?: any, cb?: Function) {
    logStream.write(str, encoding, cb);
    return stdout_write.apply(this, arguments) as boolean;
}

// Wrap write function for stderr
function writeStderr(buffer: Buffer | string, cb?: Function): boolean;
function writeStderr(str: string, encoding?: string, cb?: Function): boolean;
function writeStderr(this: any, str: Buffer | string, encoding?: any, cb?: Function) {
    logStream.write(str, encoding, cb);
    return stderr_write.apply(this, arguments) as boolean;
}

process.stdout.write = writeStdout;
process.stderr.write = writeStderr;

const LOG_FILE = path.join(__dirname, "..", "log.md");

function flog(message: string) {
    fs.writeFileSync(LOG_FILE, message + "\n", { flag: "a+" });
}

const { app, Menu, MenuItem } = electron;
app.dock.hide();

interface Logger {
    info(message: string): void;
    error(message: string): void;
}

let log: Logger = {
    info: (message: string) => {
        console.log(`Info: ${message}`);
    },
    error: (message: string) => {
        console.error(`Error: ${message}`);
    }
};


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
        contextMenu.append(menuSeparator);
        contextMenu.append(menuExit);

        tray.setToolTip(`Fortify`);
        tray.setContextMenu(contextMenu);

        StartService();
        // CreateWindow();
    })()
        .catch((err) => {
            console.error(err);
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
            log.info(`${e.address}`);
            log.info(`USER PROFILE: ${process.env["USERPROFILE"]}`);
        })
        .on("error", (e: Error) => {
            console.error(e);
            log.error(e.message + "\n" + e.stack);
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
        .on("close", (e: any) => {
            log.info(`Close: ${e.remoteAddress}`);
            console.log("Close:", e.remoteAddress);
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