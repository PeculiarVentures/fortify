import * as wsServer from '@webcrypto-local/server';
import {
  screen,
  BrowserWindow as ElectronWindow,
} from 'electron';
import { BrowserWindow } from './browser_window';
import { l10n } from '../l10n';
import { windowSizes } from '../constants';
import { logger } from '../logger';
import { DialogsStorage } from './dialogs_storage';

interface IP11PinWindowParams {
  resolve: (pin: string) => void;
  reject: (error: Error) => void;
  pin: string;
  origin: string;
  label?: string;
}

interface IKeyPinWindowParams {
  accept: boolean;
  resolve: (accept: boolean) => void;
  pin: string;
  origin: string;
}

interface IErrorWindowParams {
  text: string;
}

interface IQuestionWindowParams {
  id: string;
  showAgain?: boolean;
  showAgainValue?: boolean;
  text: string;
  result: number;
}

interface IWarningWindowParams {
  title?: string;
  id: string;
  showAgain?: boolean;
  showAgainValue?: boolean;
  text: string;
  buttonLabel: string;
}

class WindowsController {
  windows: Assoc<BrowserWindow> = {};

  static getScreenSize() {
    return screen.getPrimaryDisplay().bounds;
  }

  showAboutWindow() {
    /**
     * Don't create if the window exists.
     */
    if (this.windows.about) {
      this.windows.about.focus();
      this.windows.about.show();

      return;
    }

    this.windows.about = new BrowserWindow({
      params: {
        titleKey: 'about',
      },
      app: 'about',
      size: 'small',
      title: l10n.get('about'),
      onClosed: () => {
        delete this.windows.about;
      },
    });
  }

  showSettingsWindow() {
    /**
     * Don't create if the window exists.
     */
    if (this.windows.settings) {
      this.windows.settings.focus();
      this.windows.settings.show();

      return;
    }

    this.windows.settings = new BrowserWindow({
      params: {
        titleKey: 'settings',
      },
      size: 'default',
      app: 'settings',
      title: l10n.get('settings'),
      onClosed: () => {
        delete this.windows.settings;
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showP11PinWindow(params: IP11PinWindowParams) {
    const browserWindow = new BrowserWindow({
      params: {
        titleKey: params.label || 'p11-pin',
        ...params,
      },
      size: 'default',
      app: 'p11-pin',
      windowOptions: {
        alwaysOnTop: true,
      },
      title: params.label || l10n.get('p11-pin'),
      onClosed: () => {
        if (params.pin) {
          params.resolve(params.pin);
        } else {
          params.reject(new wsServer.WebCryptoLocalError(10001, 'Incorrect PIN value. It cannot be empty.'));
        }
      },
    });

    browserWindow.window.on('ready-to-show', () => {
      browserWindow.focus();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showKeyPinWindow(params: IKeyPinWindowParams) {
    const { width, height } = WindowsController.getScreenSize();

    const browserWindow = new BrowserWindow({
      params: {
        titleKey: 'key-pin',
        ...params,
      },
      size: 'default',
      app: 'key-pin',
      title: l10n.get('key-pin'),
      windowOptions: {
        modal: true,
        alwaysOnTop: true,
        x: width - windowSizes.default.width,
        y: height - windowSizes.default.height,
      },
      onClosed: () => {
        params.resolve(params.accept);
      },
    });

    browserWindow.window.on('ready-to-show', () => {
      browserWindow.focus();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showTokenWindow(
    onClosed: (result: number) => void,
  ) {
    const params = {
      type: 'token',
      text: l10n.get('question.new.token'),
      id: 'question.new.token',
      showAgain: true,
      showAgainValue: false,
      result: 0,
    };

    if (
      params.id
      && params.showAgain
      && DialogsStorage.hasDialog(params.id)
    ) {
      logger.info(`Don't show dialog '${params.id}'. It's disabled`);

      return;
    }

    const browserWindow = new BrowserWindow({
      params: {
        titleKey: 'question',
        ...params,
      },
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
      },
      title: l10n.get('question'),
      onClosed: () => {
        DialogsStorage.onDialogClose(browserWindow.window);

        onClosed(params.result);
      },
    });
  }

  showErrorWindow(params: IErrorWindowParams, onClosed: () => void) {
    /**
     * Don't create if the window exists.
     */
    if (this.windows.error) {
      this.windows.error.focus();
      this.windows.error.show();

      return;
    }

    this.windows.error = new BrowserWindow({
      params: {
        type: 'error',
        titleKey: 'error',
        ...params,
      },
      app: 'message',
      size: 'small',
      title: l10n.get('error'),
      windowOptions: {
        alwaysOnTop: true,
      },
      onClosed: () => {
        onClosed();

        delete this.windows.error;
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showQuestionWindow(
    params: IQuestionWindowParams,
    onClosed: (params: IQuestionWindowParams) => void,
    parent?: ElectronWindow,
  ) {
    if (
      params.id
      && params.showAgain
      && DialogsStorage.hasDialog(params.id)
    ) {
      logger.info(`Don't show dialog '${params.id}'. It's disabled`);

      return;
    }

    const browserWindow = new BrowserWindow({
      params: {
        type: 'question',
        titleKey: 'question',
        ...params,
      },
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
        parent,
        modal: !!parent,
      },
      title: l10n.get('question'),
      onClosed: () => {
        DialogsStorage.onDialogClose(browserWindow.window);

        onClosed(browserWindow.window.params as IQuestionWindowParams);
      },
    });
  }

  showWarningWindow(params: IWarningWindowParams, onClosed: () => void) {
    if (
      params.id
      && params.showAgain
      && DialogsStorage.hasDialog(params.id)
    ) {
      logger.info(`Don't show dialog '${params.id}'. It's disabled`);

      return;
    }

    /**
     * Don't create if the window exists.
     */
    if (this.windows.warning) {
      this.windows.warning.focus();
      this.windows.warning.show();

      return;
    }

    this.windows.warning = new BrowserWindow({
      params: {
        type: 'warning',
        titleKey: params.title || 'warning',
        ...params,
      },
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
      },
      title: params.title || l10n.get('warning'),
      onClosed: () => {
        DialogsStorage.onDialogClose(this.windows.warning.window);

        onClosed();

        delete this.windows.warning;
      },
    });
  }
}

export const windowsController = new WindowsController();
