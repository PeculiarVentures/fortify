import { icons } from "../const";
import { t } from "../locale";
import { CreateWindow } from "../window";

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

let warnWindow: Electron.BrowserWindow | null = null;

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
        },
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    warnWindow.on("closed", () => {
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
        },
    });

    // Emitted when the window is closed.
    window.on("closed", () => {
        if (cb) {
            cb(window.params.result);
        }
    });

    return window;
}
