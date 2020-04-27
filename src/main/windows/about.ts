import { icons } from '../const';
import { t } from '../locale';
import { CreateWindow } from '../window';

let aboutWindow: Electron.BrowserWindow | null = null;

export function CreateAboutWindow() {
  // Create the browser window.
  if (aboutWindow) {
    aboutWindow.focus();

    return;
  }

  aboutWindow = CreateWindow({
    app: 'about',
    width: 400,
    height: 300,
    autoHideMenuBar: true,
    minimizable: false,
    fullscreen: false,
    fullscreenable: false,
    resizable: false,
    title: t('about'),
    icon: icons.favicon,
    dock: true,
  });

  // Emitted when the window is closed.
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}
