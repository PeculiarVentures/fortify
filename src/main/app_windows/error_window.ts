import { Window, IWindowOptions } from './window';
import { intl } from '../locale';
import { windows } from '../application';

interface IErrorWindowParams {
  params: {
    type: 'error';
    text: string;
  };
}

type ErrorWindowOptionsType = Pick<IWindowOptions, 'onClosed'> & IErrorWindowParams;

export class ErrorWindow extends Window {
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
}

export function CreateErrorWindow(options: ErrorWindowOptionsType) {
  // Create the browser window.
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
  }) as any;
}
