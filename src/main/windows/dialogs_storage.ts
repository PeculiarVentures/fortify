import * as fs from 'fs';
import logger from '../logger';
import * as constants from '../constants';
import type { IBrowserWindow } from './browser_window';

export class DialogsStorage {
  static saveDialogs(dialogs: string[]) {
    fs.writeFileSync(constants.APP_DIALOG_FILE, JSON.stringify(dialogs, null, '  '), { flag: 'w+' });
  }

  static getDialogs() {
    let dialogs: string[] = [];

    if (fs.existsSync(constants.APP_DIALOG_FILE)) {
      try {
        const json = fs.readFileSync(constants.APP_DIALOG_FILE).toString();

        dialogs = JSON.parse(json);

        if (!Array.isArray(dialogs)) {
          throw new TypeError('Bad JSON format. Must be Array of strings');
        }
      } catch (error) {
        logger.error('dialog-storage', 'Cannot parse JSON file', {
          file: constants.APP_DIALOG_FILE,
          error: error.message,
          stack: error.stack,
        });
      }
    }

    return dialogs;
  }

  static hasDialog(name: string) {
    return DialogsStorage.getDialogs().includes(name);
  }

  static onDialogClose(window: IBrowserWindow) {
    if (window.params && window.params.id && window.params.showAgainValue) {
      const dialogs = DialogsStorage.getDialogs();

      dialogs.push(window.params.id);
      DialogsStorage.saveDialogs(dialogs);

      logger.info('dialog-storage', 'Disable dialog', {
        id: window.params.id,
      });
    }
  }
}
