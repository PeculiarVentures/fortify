/* eslint-disable class-methods-use-this */

import {
  BrowserWindow as ElectronWindow,
  shell,
  globalShortcut,
} from 'electron';
import * as url from 'url';
import { logger } from '../logger';
import * as constants from '../constants';
import { l10n } from '../l10n';

type WindowAppType = 'about' | 'key-pin' | 'message' | 'p11-pin' | 'settings' | 'index';

export interface IBrowserWindow extends ElectronWindow {
  app: WindowAppType;
  lang: string;
  params: Assoc<any>;
}

export interface IWindowOptions {
  app: WindowAppType;
  title: string;
  size?: keyof typeof constants.windowSizes;
  params?: Assoc<any>;
  onClosed: (...args: any[]) => void;
  windowOptions?: {
    modal?: boolean;
    alwaysOnTop?: boolean;
    x?: number;
    y?: number;
    center?: boolean;
    parent?: ElectronWindow ;
    show?: boolean;
  };
}

/**
 * Base class for create browser windows and interact with them.
 */
export class BrowserWindow {
  window: IBrowserWindow;

  constructor(options: IWindowOptions) {
    this.window = new ElectronWindow({
      title: options.title,
      ...this.getWindowDefaultOptions(),
      ...this.getWindowSize(options.size),
      ...options.windowOptions,
    }) as IBrowserWindow;

    this.onInit(options);
  }

  private onInit(options: IWindowOptions) {
    logger.info(`Fortify: Create window ${options.app}`);

    this.window.loadURL(url.format({
      pathname: constants.HTML_PATH,
      protocol: 'file:',
      slashes: true,
    }));

    this.window.lang = l10n.lang;
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
      icon: constants.icons.favicon,
      autoHideMenuBar: true,
      minimizable: false,
      maximizable: false,
      fullscreen: false,
      fullscreenable: false,
      // Prevent resize window on production
      resizable: constants.isDevelopment,
      show: false,
      ...this.getWindowSize(),
      webPreferences: {
        nodeIntegration: true,
        // Prevent open DevTools on production
        devTools: constants.isDevelopment,
      },
    };
  }

  private getWindowSize(size: keyof typeof constants.windowSizes = 'default') {
    if (size === 'small') {
      return constants.windowSizes.small;
    }

    return constants.windowSizes.default;
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