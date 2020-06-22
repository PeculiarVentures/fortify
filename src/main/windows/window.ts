import { app, BrowserWindow, shell, globalShortcut } from 'electron';
import * as url from 'url';
import * as winston from 'winston';

import { HTML_PATH, windowSizes, icons } from '../const';
import { locale } from '../locale';

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
  const isDev = process.env.NODE_ENV === 'development';

  const window = new BrowserWindow({
    icon: icons.favicon,
    autoHideMenuBar: true,
    dock: true,
    minimizable: false,
    fullscreen: false,
    fullscreenable: false,
    // Prevent resize window on production
    resizable: isDev,
    minWidth: windowSizes.small.width,
    minHeight: windowSizes.small.height,
    show: false,
    ...options,
    webPreferences: {
      nodeIntegration: true,
      // Prevent open DevTools on production
      devTools: isDev,
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

  // Open a url from <a> on default OS browser
  window.webContents.on('will-navigate', (e: Event, href: string) => {
    if (href !== window.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(href);
    }
  });

  // Show page only after `lfinish-load` event and prevent show index page
  if (options.app !== 'index') {
    window.webContents.on('did-finish-load', () => {
      window.show();
    });
  }

  // Prevent BrowserWindow refreshes
  window.on('focus', () => {
    globalShortcut.registerAll(['CommandOrControl+R', 'F5'], () => {});
  });

  window.on('blur', () => {
    globalShortcut.unregisterAll();
  });

  window.on('close', () => {
    globalShortcut.unregisterAll();
  });

  return window;
}
