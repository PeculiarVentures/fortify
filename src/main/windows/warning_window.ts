import { logger } from '../logger';
import { BrowserWindow, IWindowOptions } from './window';
import { l10n } from '../l10n';
import { windows } from './list';
import { DialogsStorage } from './dialogs_storage';

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

export class WarningWindow extends BrowserWindow {
  constructor(options: WarningWindowOptionsType) {
    super({
      ...options,
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
      },
      title: options.params.title || l10n.get('warning'),
    });
  }

  /**
   * Create the browser window.
   */
  static create(options: WarningWindowOptionsType) {
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
    if (windows.warning) {
      windows.warning.focus();
      windows.warning.show();

      return;
    }

    windows.warning = new WarningWindow({
      ...options,
      onClosed: () => {
        DialogsStorage.onDialogClose(windows.warning.window);

        options.onClosed();

        delete windows.warning;
      },
    });
  }
}
