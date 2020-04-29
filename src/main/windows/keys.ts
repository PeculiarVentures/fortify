import { windows } from '../application';
import { windowSizes } from '../const';
import { intl } from '../locale';
import { CreateWindow } from './window';

export function CreateKeysWindow() {
  // Create the browser window.
  if (windows.keys) {
    windows.keys.focus();

    return;
  }

  windows.keys = CreateWindow({
    ...windowSizes.default,
    app: 'keys',
    title: intl('sites'),
  });

  // Emitted when the window is closed.
  windows.keys.on('closed', () => {
    delete windows.keys;
  });
}
