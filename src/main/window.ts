import { BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";

import { HTML_DIR } from "./const";
import { locale } from "./locale";

export interface BrowserWindowEx extends Electron.BrowserWindow {
    [key: string]: any;
    lang: string;
    params: Assoc<any>;
}

export interface BrowserWindowConstructorOptionsEx extends Electron.BrowserWindowConstructorOptions {
    app: string;
    params?: Assoc<any>;
}

export function CreateWindow(options: BrowserWindowConstructorOptionsEx) {
    const window = new BrowserWindow(options) as BrowserWindowEx;

    window.loadURL(url.format({
        pathname: path.join(HTML_DIR, "page.html"),
        protocol: "file:",
        slashes: true,
    }));

    window.lang = locale.lang;
    window.app = options.app;
    window.params = options.params || {};

    return window;
}
