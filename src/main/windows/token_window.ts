import {
  BrowserWindow as ElectronWindow,
} from 'electron';
import { logger } from '../logger';
import { BrowserWindow } from './window';
import { l10n } from '../l10n';
import { DialogsStorage } from './dialogs_storage';

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
  onClosed: (result: number) => void;
}

type TokenWindowOptionsType = ITokenWindowParams;

export class TokenWindow extends BrowserWindow {
  constructor(options: TokenWindowOptionsType) {
    super({
      ...options,
      app: 'message',
      size: 'small',
      windowOptions: {
        alwaysOnTop: true,
        parent: options.parent,
        modal: !!options.parent,
      },
      title: options.params.title || l10n.get('question'),
    });
  }

  /**
   * Create the browser window.
   */
  static create(options: TokenWindowOptionsType) {
    if (
      options.params.id
      && options.params.showAgain
      && DialogsStorage.hasDialog(options.params.id)
    ) {
      logger.info(`Don't show dialog '${options.params.id}'. It's disabled`);

      return;
    }

    const window = new TokenWindow({
      ...options,
      onClosed: () => {
        DialogsStorage.onDialogClose(window.window);

        options.onClosed(options.params.result);
      },
    });
  }
}
