import {
  shell,
  MenuItemConstructorOptions,
} from 'electron';
import { intl } from '../locale';
import {
  CreateAboutWindow,
  CreateSettingsWindow,
} from '../windows';

export const baseTemplate = (): MenuItemConstructorOptions[] => ([
  {
    label: intl('about'),
    click: () => {
      CreateAboutWindow();
    },
  },
  {
    label: intl('settings'),
    click: () => {
      CreateSettingsWindow();
    },
  },
  {
    type: 'separator',
  },
  {
    label: intl('tools'),
    click: () => {
      shell.openExternal('https://tools.fortifyapp.com/');
    },
  },
  {
    label: intl('exit'),
    role: 'quit',
  },
]);
