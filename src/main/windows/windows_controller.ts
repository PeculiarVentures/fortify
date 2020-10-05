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
  pin: string;
  origin: string;
  label?: string;
}

interface IKeyPinWindowParams {
  accept: boolean;
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
    return new Promise((resolve) => {
      /**
       * Don't create if the window exists.
       */
      if (this.windows.about) {
        this.windows.about.focus();
        this.windows.about.show();

        resolve();

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

          resolve();
        },
      });
    });
  }

  showSettingsWindow() {
    return new Promise((resolve) => {
      /**
       * Don't create if the window exists.
       */
      if (this.windows.settings) {
        this.windows.settings.focus();
        this.windows.settings.show();

        resolve();

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

          resolve();
        },
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showP11PinWindow(params: IP11PinWindowParams): Promise<IP11PinWindowParams> {
    return new Promise((resolve) => {
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
          resolve(browserWindow.window.params as IP11PinWindowParams);
        },
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showKeyPinWindow(params: IKeyPinWindowParams): Promise<IKeyPinWindowParams> {
    return new Promise((resolve) => {
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
          resolve(browserWindow.window.params as IKeyPinWindowParams);
        },
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showTokenWindow(): Promise<number> {
    return new Promise((resolve, reject) => {
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

        reject(new Error(`'${params.id}' window disabled`));

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

          resolve(params.result);
        },
      });
    });
  }

  showErrorWindow(params: IErrorWindowParams) {
    return new Promise((resolve) => {
      /**
       * Don't create if the window exists.
       */
      if (this.windows.error) {
        this.windows.error.focus();
        this.windows.error.show();

        resolve();

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
          delete this.windows.error;

          resolve();
        },
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  showQuestionWindow(
    params: IQuestionWindowParams,
    parent?: ElectronWindow,
  ): Promise<IQuestionWindowParams> {
    return new Promise((resolve, reject) => {
      if (
        params.id
        && params.showAgain
        && DialogsStorage.hasDialog(params.id)
      ) {
        logger.info(`Don't show dialog '${params.id}'. It's disabled`);

        reject(new Error(`'${params.id}' window disabled`));

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

          resolve(browserWindow.window.params as IQuestionWindowParams);
        },
      });
    });
  }

  showWarningWindow(params: IWarningWindowParams) {
    return new Promise((resolve, reject) => {
      if (
        params.id
        && params.showAgain
        && DialogsStorage.hasDialog(params.id)
      ) {
        logger.info(`Don't show dialog '${params.id}'. It's disabled`);

        reject(new Error(`'${params.id}' window disabled`));

        return;
      }

      /**
       * Don't create if the window exists.
       */
      if (this.windows.warning) {
        this.windows.warning.focus();
        this.windows.warning.show();

        resolve();

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

          delete this.windows.warning;

          resolve();
        },
      });
    });
  }
}

export const windowsController = new WindowsController();
