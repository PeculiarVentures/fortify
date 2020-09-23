import {
  shell,
  MenuItemConstructorOptions,
} from 'electron';
import { intl } from '../locale';
import {
  AboutWindow,
  CreateSettingsWindow,
} from '../windows';

export const baseTemplate = (): MenuItemConstructorOptions[] => ([
  {
    label: intl('about'),
    click: () => {
      AboutWindow.create();
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
