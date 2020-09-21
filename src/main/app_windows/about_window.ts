import { Window, IWindowOptions } from './window';
import { intl } from '../locale';
import { windows } from '../application';

export class AboutWindow extends Window {
  constructor(options: Pick<IWindowOptions, 'onClosed'>) {
    super({
      app: 'about',
      size: 'small',
      title: intl('about'),
      ...options,
    });
  }
}

export function CreateAboutWindow() {
  // Create the browser window.
  if (windows.about) {
    windows.about.focus();
    windows.about.show();

    return;
  }

  windows.about = new AboutWindow({
    onClosed: () => {
      delete windows.about;
    },
  }) as any;
}
