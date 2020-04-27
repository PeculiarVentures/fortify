import { app, BrowserWindow } from 'electron';
import * as url from 'url';
import * as winston from 'winston';

import { HTML_PATH } from './const';
import { locale } from './locale';

let counter = 0;
const windows: { [key: number]: BrowserWindowEx } = {};

export interface BrowserWindowEx extends Electron.BrowserWindow {
  [key: string]: any;
  lang: string;
  params: Assoc<any>;
}

export interface BrowserWindowConstructorOptionsEx
  extends Electron.BrowserWindowConstructorOptions {
  app: string;
  params?: Assoc<any>;
  dock?: boolean;
}

export function CreateWindow(options: BrowserWindowConstructorOptionsEx) {
  const window = new BrowserWindow({
    ...options,
    webPreferences: {
      nodeIntegration: true,
    },
  }) as BrowserWindowEx;

  winston.info(`Fortify: Create window ${options.app}`);

  window.loadURL(url.format({
    pathname: HTML_PATH,
    protocol: 'file:',
    slashes: true,
  }));

  window.lang = locale.lang;
  window.app = options.app;
  window.params = options.params || {};

  if ('dock' in app && options.dock) {
    app.dock.show();

    // Add window to list
    const id = counter++;
    windows[id] = window;

    window.on('close', () => {
      delete windows[id];
      if (!Object.keys(windows).length) {
        app.dock.hide();
      }
    });
  }

  return window;
}
