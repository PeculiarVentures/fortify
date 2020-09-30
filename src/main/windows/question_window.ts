import {
  BrowserWindow as ElectronWindow,
} from 'electron';
import { logger } from '../logger';
import { BrowserWindow } from './window';
import { l10n } from '../l10n';
import { DialogsStorage } from './dialogs_storage';

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
  onClosed: (result: number) => void;
}

type QuestionWindowOptionsType = IQuestionWindowParams;

export class QuestionWindow extends BrowserWindow {
  constructor(options: QuestionWindowOptionsType) {
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
  static create(options: QuestionWindowOptionsType) {
    if (
      options.params.id
      && options.params.showAgain
      && DialogsStorage.hasDialog(options.params.id)
    ) {
      logger.info(`Don't show dialog '${options.params.id}'. It's disabled`);

      return;
    }

    const window = new QuestionWindow({
      ...options,
      onClosed: () => {
        DialogsStorage.onDialogClose(window.window);

        options.onClosed(options.params.result);
      },
    });
  }
}
