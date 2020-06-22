import { windowSizes } from '../const';
import { windows } from '../application';
import { intl } from '../locale';
import { CreateWindow } from './window';

export function CreateAboutWindow() {
  // Create the browser window.
  if (windows.about) {
    windows.about.focus();
    windows.about.show();

    return;
  }

  windows.about = CreateWindow({
    ...windowSizes.small,
    app: 'about',
    title: intl('about'),
  });

  // Emitted when the window is closed.
  windows.about.on('closed', () => {
    delete windows.about;
  });
}
