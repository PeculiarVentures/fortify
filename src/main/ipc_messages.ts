import {
  ipcMain,
  shell,
  IpcMainEvent,
  BrowserWindow,
} from 'electron';
import { APP_LOG_FILE } from './constants';
import { QuestionWindow, windows } from './windows';
import { l10n } from './l10n';
import { logger, loggingSwitch } from './logger';
import { ServerStorage } from './server_storage';
import { setConfig, getConfig } from './config';

const sendToRenderers = (channel: string, data: any) => {
  const browserWindows = BrowserWindow.getAllWindows();

  browserWindows.forEach((window) => {
    if (window.webContents) {
      window.webContents.send(channel, data);
    }
  });
};

// TODO: Maybe move to application.
// TODO: Review messages.
const init = (server: any) => {
  ipcMain
    .on('2key-list', async (event: IpcMainEvent) => {
      const identities = await ServerStorage.getIdentities(server);

      event.sender.send('2key-list', identities);
    })
    .on('2key-remove', (event: IpcMainEvent, arg: any) => {
      QuestionWindow.create({
        params: {
          type: 'question',
          text: l10n.get('question.2key.remove', arg),
          id: 'question.2key.remove',
          result: 0,
        },
        parent: windows.settings.window,
        onClosed: async (result) => {
          if (result) {
            logger.info(`Removing 2key session key ${arg}`);

            await ServerStorage.removeIdentity(server, arg);

            event.sender.send('2key-remove', arg);
          }
        },
      });
    })
    .on('logging-open', () => {
      shell.openItem(APP_LOG_FILE);
    })
    .on('logging-status', (event: IpcMainEvent) => {
      const config = getConfig();

      event.sender.send('logging-status', config.logging);
    })
    .on('logging-status-change', (event: IpcMainEvent) => {
      const config = getConfig();

      config.logging = !config.logging;

      setConfig(config);

      loggingSwitch(config.logging);

      event.sender.send('logging-status', config.logging);
    })
    .on('ipc-language-set', (_: IpcMainEvent, lang: string) => {
      l10n.setLang(lang);

      sendToRenderers('ipc-language-changed', l10n.lang);
    })
    .on('ipc-language-get', (event: IpcMainEvent) => {
      event.returnValue = {
        lang: l10n.lang,
        data: l10n.data,
        list: l10n.supportedLangs,
      };
    })
    .on('error', (event: IpcMainEvent) => {
      logger.error(event.toString());
    });
};

export const ipcMessages = {
  init,
};
