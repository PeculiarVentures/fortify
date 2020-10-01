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
  params: {
    resolve: (pin: string) => void;
    reject: (error: Error) => void;
    pin: string,
    origin: string,
    label?: string;
  };
}

interface IKeyPinWindowParams {
  params: {
    accept: boolean;
    resolve: (accept: boolean) => void;
    pin: string,
    origin: string,
  };
}

interface ITokenWindowParams {
  params: {
    type: 'token';
    title?: string;
    id: string;
    showAgain?: boolean;
    showAgainValue?: boolean;
    text: string;
    result: number;
  };
  parent?: ElectronWindow;
}

interface IErrorWindowParams {
  params: {
    type: 'error';
    text: string;
  };
}

interface IQuestionWindowParams {
  params: {
    type: 'question';
    title?: string;
    id: string;
    showAgain?: boolean;
    showAgainValue?: boolean;
    text: string;
    result: number;
  };
  parent?: ElectronWindow;
}

interface IWarningWindowParams {
  params: {
    type: 'warning';
    title?: string;
    id: string;
    showAgain?: boolean;
    showAgainValue?: boolean;
    text: string;
    buttonLabel: string;
  };
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
      size: 'default',
      app: 'settings',
      title: l10n.get('settings'),
      onClosed: () => {
        delete this.windows.settings;
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showP11PinWindow(options: IP11PinWindowParams) {
    const browserWindow = new BrowserWindow({
      ...options,
      size: 'default',
      app: 'p11-pin',
      windowOptions: {
        alwaysOnTop: true,
      },
      title: options.params.label || l10n.get('p11-pin'),
      onClosed: () => {
        if (options.params.pin) {
          options.params.resolve(options.params.pin);
        } else {
          options.params.reject(new wsServer.WebCryptoLocalError(10001, 'Incorrect PIN value. It cannot be empty.'));
        }
      },
    });

    browserWindow.window.on('ready-to-show', () => {
      browserWindow.focus();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showKeyPinWindow(options: IKeyPinWindowParams) {
    const { width, height } = WindowsController.getScreenSize();

    const browserWindow = new BrowserWindow({
      ...options,
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
        options.params.resolve(options.params.accept);
      },
    });

    browserWindow.window.on('ready-to-show', () => {
      browserWindow.focus();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showTokenWindow(options: ITokenWindowParams, onClosed: (result: number) => void) {
    if (
      options.params.id
      && options.params.showAgain
      && DialogsStorage.hasDialog(options.params.id)
    ) {
      logger.info(`Don't show dialog '${options.params.id}'. It's disabled`);

      return;
    }

    const browserWindow = new BrowserWindow({
      ...options,
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
        parent: options.parent,
        modal: !!options.parent,
      },
      title: options.params.title || l10n.get('question'),
      onClosed: () => {
        DialogsStorage.onDialogClose(browserWindow.window);

        onClosed(options.params.result);
      },
    });
  }

  showErrorWindow(options: IErrorWindowParams, onClosed: () => void) {
    /**
     * Don't create if the window exists.
     */
    if (this.windows.error) {
      this.windows.error.focus();
      this.windows.error.show();

      return;
    }

    this.windows.error = new BrowserWindow({
      ...options,
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
  showQuestionWindow(options: IQuestionWindowParams, onClosed: (result: number) => void) {
    if (
      options.params.id
      && options.params.showAgain
      && DialogsStorage.hasDialog(options.params.id)
    ) {
      logger.info(`Don't show dialog '${options.params.id}'. It's disabled`);

      return;
    }

    const browserWindow = new BrowserWindow({
      ...options,
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
        parent: options.parent,
        modal: !!options.parent,
      },
      title: options.params.title || l10n.get('question'),
      onClosed: () => {
        DialogsStorage.onDialogClose(browserWindow.window);

        onClosed(options.params.result);
      },
    });
  }

  showWarningWindow(options: IWarningWindowParams, onClosed: () => void) {
    if (
      options.params.id
      && options.params.showAgain
      && DialogsStorage.hasDialog(options.params.id)
    ) {
      logger.info(`Don't show dialog '${options.params.id}'. It's disabled`);

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
      ...options,
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
      },
      title: options.params.title || l10n.get('warning'),
      onClosed: () => {
        DialogsStorage.onDialogClose(this.windows.warning.window);

        onClosed();

        delete this.windows.warning;
      },
    });
  }
}

export const windowsController = new WindowsController();
