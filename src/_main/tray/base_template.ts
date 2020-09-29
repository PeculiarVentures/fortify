import {
  shell,
  MenuItemConstructorOptions,
} from 'electron';
import { intl } from '../utils';
import { TOOLS_LINK } from '../constants';
// import {
//   AboutWindow,
//   SettingsWindow,
// } from '../windows';

export const baseTemplate = (): MenuItemConstructorOptions[] => ([
  {
    label: intl('about'),
    click: () => {
      // TODO: Add handler.
      // AboutWindow.create();
    },
  },
  {
    label: intl('settings'),
    click: () => {
      // TODO: Add handler.
      // SettingsWindow.create();
    },
  },
  {
    type: 'separator',
  },
  {
    label: intl('tools'),
    click: () => {
      shell.openExternal(TOOLS_LINK);
    },
  },
  {
    label: intl('exit'),
    role: 'quit',
  },
]);
