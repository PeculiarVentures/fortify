import { windows } from '../application';
import { windowSizes } from '../const';
import { CreateWindow } from './window';
import { intl } from '../locale';

export function CreateSettingsWindow() {
  // Create the browser window.
  if (windows.settings) {
    windows.settings.focus();
    windows.settings.show();

    return;
  }

  windows.settings = CreateWindow({
    ...windowSizes.default,
    app: 'settings',
    title: intl('settings'),
  });

  // Emitted when the window is closed.
  windows.settings.on('closed', () => {
    delete windows.settings;
  });
}
