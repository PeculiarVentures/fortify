import { Window, IWindowOptions } from './window';
import { intl } from '../locale';
import { windows } from '../application';

export class SettingsWindow extends Window {
  constructor(options: Pick<IWindowOptions, 'onClosed'>) {
    super({
      app: 'settings',
      title: intl('settings'),
      ...options,
    });
  }
}

export function CreateSettingsWindow() {
  // Create the browser window.
  if (windows.settings) {
    windows.settings.focus();
    windows.settings.show();

    return;
  }

  windows.settings = new SettingsWindow({
    onClosed: () => {
      delete windows.settings;
    },
  }) as any;
}
