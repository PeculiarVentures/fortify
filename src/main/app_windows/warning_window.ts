import * as winston from 'winston';
import { Window, IWindowOptions } from './window';
import { intl } from '../locale';
import { windows } from '../application';
import { DialogsStorage } from './utils';

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

type WarningWindowOptionsType = Pick<IWindowOptions, 'onClosed'> & IWarningWindowParams;

export class WarningWindow extends Window {
  constructor(options: WarningWindowOptionsType) {
    super({
      ...options,
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
      },
      title: options.params.title || intl('warning'),
    });
  }
}

export function CreateWarningWindow(options: WarningWindowOptionsType) {
  if (options.params.id && options.params.showAgain && DialogsStorage.hasDialog(options.params.id)) {
    winston.info(`Don't show dialog '${options.params.id}'. It's disabled`);

    return;
  }

  // Create the browser window.
  if (windows.warning) {
    windows.warning.focus();
    windows.warning.show();

    return;
  }

  windows.warning = new WarningWindow({
    ...options,
    onClosed: () => {
      DialogsStorage.onDialogClose(windows.warning.window as any);

      options.onClosed();

      delete windows.warning;
    },
  }) as any;
}
