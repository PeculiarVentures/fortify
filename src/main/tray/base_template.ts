import {
  shell,
  MenuItemConstructorOptions,
} from 'electron';
import { TOOLS_LINK } from '../constants';
import { windowsController } from '../windows';

export const baseTemplate = (): MenuItemConstructorOptions[] => ([
  {
    label: 'About Fortify',
    click: () => {
      windowsController.showPreferencesWindow('about');
    },
  },
  {
    type: 'separator',
  },
  {
    label: 'Preferences...',
    click: () => {
      windowsController.showPreferencesWindow();
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
    label: 'Check For Updates',
    click: () => {},
  },
  {
    type: 'separator',
  },
  {
    label: 'Quit Fortify',
    role: 'quit',
  },
]);
