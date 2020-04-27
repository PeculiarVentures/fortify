import { icons, windowSizes } from '../const';
import { t } from '../locale';
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
    autoHideMenuBar: true,
    title: t('about'),
    icon: icons.favicon,
    dock: true,
  });

  // Emitted when the window is closed.
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}
