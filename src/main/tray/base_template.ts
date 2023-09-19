import {
  shell,
  MenuItemConstructorOptions,
} from 'electron';
import { WindowPreferencesName } from '../../shared';
import { TOOLS_LINK } from '../constants';
import { windowsController } from '../windows';
import { autoUpdater } from '../updater';
import { l10n } from '../l10n';

export const baseTemplate = (): MenuItemConstructorOptions[] => ([
  {
    label: l10n.get('about.app'),
    click: () => {
      windowsController.showPreferencesWindow(WindowPreferencesName.About);
    },
  },
  {
    label: l10n.get('updates.check'),
    click: () => {
      windowsController.showPreferencesWindow(WindowPreferencesName.Updates);
      autoUpdater.checkForUpdates();
    },
  },
  {
    type: 'separator',
  },
  {
    label: l10n.get('preferences'),
    click: () => {
      windowsController.showPreferencesWindow(WindowPreferencesName.Settings);
    },
  },
  {
    label: l10n.get('tools'),
    click: () => {
      shell.openExternal(TOOLS_LINK);
    },
  },
  {
    type: 'separator',
  },
  {
    label: l10n.get('quit'),
    role: 'quit',
  },
]);
