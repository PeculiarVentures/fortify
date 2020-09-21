/* eslint-disable class-methods-use-this */

import {
  BrowserWindow, shell, globalShortcut,
} from 'electron';
import * as url from 'url';
import * as winston from 'winston';

import { HTML_PATH, windowSizes, icons } from '../const';
import { locale } from '../locale';

const isDev = process.env.NODE_ENV === 'development';

export interface IBrowserWindow extends Electron.BrowserWindow {
  app: string;
  lang: string;
  params: Assoc<any>;
}

export interface IWindowOptions {
  app: string;
  title?: string;
  size?: keyof typeof windowSizes;
  params?: Assoc<any>;
  onClosed: () => void;
  windowOptions?: {
    modal?: boolean;
    alwaysOnTop?: boolean;
    x?: number;
    y?: number;
  };
}

export class Window {
  window: IBrowserWindow;

  constructor(options: IWindowOptions) {
    this.window = new BrowserWindow({
      ...this.getWindowDefaultOptions(),
      ...this.getWindowSize(options.size),
      ...options.windowOptions,
    }) as IBrowserWindow;

    this.onInit(options);
  }

  private onInit(options: IWindowOptions) {
    winston.info(`Fortify: Create window ${options.app}`);

    this.window.loadURL(url.format({
      pathname: HTML_PATH,
      protocol: 'file:',
      slashes: true,
    }));

    this.window.lang = locale.lang;
    this.window.app = options.app;
    this.window.params = options.params || {};

    this.onInitListeners(options);
  }

  private onInitListeners(options: IWindowOptions) {
    // Open a url from <a> on default OS browser
    this.window.webContents.on('will-navigate', (e: Event, href: string) => {
      if (href !== this.window.webContents.getURL()) {
        e.preventDefault();
        shell.openExternal(href);
      }
    });

    // Show page only after `lfinish-load` event and prevent show index page
    if (this.window.app !== 'index') {
      this.window.webContents.on('did-finish-load', () => {
        this.window.show();
      });
    }

    // Prevent BrowserWindow refreshes
    this.window.on('focus', () => {
      globalShortcut.registerAll(['CommandOrControl+R', 'F5'], () => {});
    });

    this.window.on('blur', () => {
      globalShortcut.unregisterAll();
    });

    this.window.on('close', () => {
      globalShortcut.unregisterAll();
    });

    this.window.on('closed', options.onClosed);
  }

  private getWindowDefaultOptions(): Electron.BrowserWindowConstructorOptions {
    return {
      icon: icons.favicon,
      autoHideMenuBar: true,
      minimizable: false,
      fullscreen: false,
      fullscreenable: false,
      // Prevent resize window on production
      resizable: isDev,
      show: false,
      ...this.getWindowSize(),
      webPreferences: {
        nodeIntegration: true,
        // Prevent open DevTools on production
        devTools: isDev,
      },
    };
  }

  private getWindowSize(size: keyof typeof windowSizes = 'default') {
    if (size === 'small') {
      return windowSizes.small;
    }

    return windowSizes.default;
  }

  public focus() {
    this.window.focus();
  }

  public show() {
    this.window.show();
  }

  public hide() {
    this.window.hide();
  }
}
