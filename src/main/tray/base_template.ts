import {
  shell,
  MenuItemConstructorOptions,
} from 'electron';
import { TOOLS_LINK } from '../constants';
import { windowsController } from '../windows';
import { autoUpdater } from '../updater';

export const baseTemplate = (): MenuItemConstructorOptions[] => ([
  {
    label: 'About Fortify',
    click: () => {
      windowsController.showPreferencesWindow('about');
    },
  },
  {
    label: 'Check For Updates...',
    click: async () => {
      windowsController.showPreferencesWindow('updates');
      autoUpdater.checkForUpdates();
    },
  },
  {
    type: 'separator',
  },
  {
    label: 'Preferences...',
    click: () => {
      windowsController.showPreferencesWindow('settings');
    },
  },
  {
    label: 'Tools',
    click: () => {
      shell.openExternal(TOOLS_LINK);
    },
  },
  {
    type: 'separator',
  },
  {
    label: 'Quit Fortify',
    role: 'quit',
  },
]);
