import * as application from '../application';
import { icons, windowSizes } from '../const';
import { intl } from '../locale';
import { CreateWindow } from './window';

export function CreateKeysWindow() {
  // Create the browser window.
  if (application.windows.keys) {
    application.windows.keys.focus();

    return;
  }

  application.windows.keys = CreateWindow({
    ...windowSizes.default,
    app: 'keys',
    autoHideMenuBar: true,
    title: intl('sites'),
    icon: icons.favicon,
    dock: true,
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  application.windows.keys.on('closed', () => {
    delete application.windows.keys;
  });
}
