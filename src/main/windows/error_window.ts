import { BrowserWindow, IWindowOptions } from './window';
import { intl } from '../locale';
import { windows } from '../application';

interface IErrorWindowParams {
  params: {
    type: 'error';
    text: string;
  };
}

type ErrorWindowOptionsType = Pick<IWindowOptions, 'onClosed'> & IErrorWindowParams;

export class ErrorWindow extends BrowserWindow {
  constructor(options: ErrorWindowOptionsType) {
    super({
      ...options,
      app: 'message',
      size: 'small',
      title: intl('error'),
      windowOptions: {
        alwaysOnTop: true,
      },
    });
  }

  /**
   * Create the browser window.
   */
  static create(options: ErrorWindowOptionsType) {
    /**
     * Don't create if the window exists.
     */
    if (windows.error) {
      windows.error.focus();
      windows.error.show();

      return;
    }

    windows.error = new ErrorWindow({
      ...options,
      onClosed: () => {
        options.onClosed();

        delete windows.error;
      },
    });
  }
}
