import { windowSizes } from '../const';
import { intl } from '../locale';
import { CreateWindow } from './window';

let aboutWindow: Electron.BrowserWindow | null = null;

export function CreateAboutWindow() {
  // Create the browser window.
  if (aboutWindow) {
    aboutWindow.focus();

    return;
  }

  aboutWindow = CreateWindow({
    ...windowSizes.small,
    app: 'about',
    title: intl('about'),
  });

  // Emitted when the window is closed.
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}