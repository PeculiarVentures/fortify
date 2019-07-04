import * as fs from "fs";
import * as winston from "winston";
import { APP_DIALOG_FILE, icons } from "../const";
import { t } from "../locale";
import { BrowserWindowEx, CreateWindow } from "../window";

let errorWindow: Electron.BrowserWindow | null = null;
/**
 * Creates Error window
 *
 * @param text  Message text
 * @param cb    Callback on message close
 * @returns
 */
export function CreateErrorWindow(text: string, cb: () => void) {
    // Create the browser window.
    if (errorWindow) {
        errorWindow.show();
        return;
    }
    errorWindow = CreateWindow({
        app: "message",
        width: 500,
        height: 300,
        autoHideMenuBar: true,
        minimizable: false,
        fullscreen: false,
        fullscreenable: false,
        resizable: false,
        title: t("error"),
        icon: icons.favicon,
        alwaysOnTop: true,
        params: {
            type: "error",
            title: t("error"),
            text,
        },
    });

    // Emitted when the window is closed.
    errorWindow.on("closed", () => {
        errorWindow = null;
        if (cb) {
            cb();
        }
    });
}

let warnWindow: BrowserWindowEx | null = null;

interface ICreateWarningWindowOptions extends ICreateWindowOptions {
    buttonLabel?: string;
}

/**
 * Creates Warning window
 *
 * @param text    Message text
 * @param options modal dialog parameters
 * @param cb    Callback on message close
 * @returns
 */
export function CreateWarningWindow(text: string, options: ICreateWarningWindowOptions, cb?: () => void) {

    if (options.id && options.showAgain && hasDialog(options.id)) {
        winston.info(`Don't show dialog '${options.id}'. It's disabled`);
        return null;
    }

    options = options || {};
    // Create the browser window.
    if (warnWindow) {
        warnWindow.show();
        return;
    }
    warnWindow = CreateWindow({
        app: "message",
        width: 500,
        height: 300,
        autoHideMenuBar: true,
        minimizable: false,
        fullscreenable: false,
        resizable: false,
        title: options.title || t("warning"),
        center: true,
        icon: icons.favicon,
        alwaysOnTop: !!options.alwaysOnTop,
        modal: !!options.parent,
        parent: options.parent,
        dock: options.parent ? false : options.dock,
        params: {
            type: "warning",
            title: options.title || t("warning"),
            buttonLabel: options.buttonLabel || t("close"),
            text,
            id: options.id,
            showAgain: options.showAgain,
            showAgainValue: false,
        },
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    warnWindow.on("closed", () => {
        if (warnWindow) {
            onDialogClose(warnWindow);
        }
        warnWindow = null;
        if (cb) {
            cb();
        }
    });
}

/**
 *
 * @param text
 * @param options
 * @param cb
 * @return {BrowserWindow}
 */
export function CreateQuestionWindow(text: string, options: ICreateWindowOptions, cb?: (result: number) => void) {
    if (options.id && options.showAgain && hasDialog(options.id)) {
        winston.info(`Don't show dialog '${options.id}'. It's disabled`);
        return null;
    }

    // Create the browser window.
    const window = CreateWindow({
        app: "message",
        width: 500,
        height: 300,
        autoHideMenuBar: true,
        minimizable: false,
        fullscreenable: false,
        resizable: false,
        title: t("question"),
        icon: icons.favicon,
        modal: !!options.parent,
        parent: options.parent,
        dock: options.parent ? false : options.dock,
        params: {
            type: "question",
            title: options.title || t("question"),
            text,
            result: 0,
            id: options.id,
            showAgain: options.showAgain,
            showAgainValue: false,
        },
    });

    // Emitted when the window is closed.
    window.on("closed", () => {
        onDialogClose(window);

        if (cb) {
            cb(window.params.result);
        }
    });

    return window;
}
function onDialogClose(window: BrowserWindowEx) {
    if (window.params && window.params.id && window.params.showAgainValue) {
        const dialogs = getDialogs();
        dialogs.push(window.params.id);
        saveDialogs(dialogs);
        winston.info(`Disable dialog ${window.params.id}`);
    }
}

function saveDialogs(dialogs: string[]) {
    fs.writeFileSync(APP_DIALOG_FILE, JSON.stringify(dialogs, null, "  "), { flag: "w+" });
}

function getDialogs() {
    let dialogs: string[] = [];
    if (fs.existsSync(APP_DIALOG_FILE)) {
        try {
            const json = fs.readFileSync(APP_DIALOG_FILE).toString();
            dialogs = JSON.parse(json);
            if (!Array.isArray(dialogs)) {
                throw new TypeError("Bad JSON format. Must be Array of strings");
            }
        } catch (e) {
            winston.error(`Cannot parse JSON file ${APP_DIALOG_FILE}`);
            winston.error(e);
        }
    }
    return dialogs;
}

function hasDialog(name: string) {
    return getDialogs().includes(name);
}
