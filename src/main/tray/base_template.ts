import {
  shell,
  MenuItemConstructorOptions,
} from 'electron';
import { intl } from '../locale';
import {
  AboutWindow,
  SettingsWindow,
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
      SettingsWindow.create();
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
