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
    .on('ipc-2key-list-get', async (event: IpcMainEvent) => {
      const identities = await ServerStorage.getIdentities(server);

      event.returnValue = identities;
    })
    .on('ipc-2key-remove', (event: IpcMainEvent, arg: any) => {
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

            event.sender.send('ipc-2key-removed', arg);
          }
        },
      });
    })
    .on('ipc-logging-open', () => {
      shell.openItem(APP_LOG_FILE);
    })
    .on('ipc-logging-status-get', (event: IpcMainEvent) => {
      const config = getConfig();

      event.returnValue = config.logging;
    })
    .on('ipc-logging-status-change', (event: IpcMainEvent) => {
      const config = getConfig();

      config.logging = !config.logging;

      setConfig(config);

      loggingSwitch(config.logging);

      event.sender.send('ipc-logging-status-changed', config.logging);
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
