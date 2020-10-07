import * as fs from 'fs';
import { logger } from '../logger';
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
      } catch (e) {
        logger.error(`Dialog storage: Cannot parse JSON file ${constants.APP_DIALOG_FILE}`);
        logger.error(e);
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
      logger.info(`Dialog storage: Disable dialog ${window.params.id}`);
    }
  }
}
