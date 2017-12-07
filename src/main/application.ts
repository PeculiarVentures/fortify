import * as electron from "electron";
import * as fs from "fs";
import * as WebCryptoLocal from "webcrypto-local";
import * as winston from "winston";

import { ConfigureRead } from "./config";
import { APP_CONFIG_FILE, APP_LOG_FILE, APP_TMP_DIR } from "./const";
import { BrowserWindowEx } from "./window";

if (!fs.existsSync(APP_TMP_DIR)) {
    fs.mkdirSync(APP_TMP_DIR);
}

export let server: WebCryptoLocal.LocalServer;
export let configure = ConfigureRead(APP_CONFIG_FILE);
export const windows: Assoc<BrowserWindowEx> = {};

/**
 * Turn on/of logger
 *
 * @param enabled
 */
export function LoggingSwitch(enabled: boolean) {
    if (enabled) {
        const options = { flag: "w+" };
        // if (!fs.existsSync(APP_LOG_FILE)) {
        //     fs.writeFileSync(APP_LOG_FILE, "", options);
        // }
        winston.add(winston.transports.File, { filename: APP_LOG_FILE, options });
    } else {
        winston.clear();
    }
}

LoggingSwitch(!!configure.logging);

export function load(options: WebCryptoLocal.IServerOptions) {
    const LocalServer = require("webcrypto-local").LocalServer as typeof WebCryptoLocal.LocalServer;
    server = new LocalServer(options);
}

export function quit() {
    server.close(() => {
        electron.app.quit();
    });
}
