import { BrowserWindow, IWindowOptions } from './window';
import { intl } from '../locale';
import { windows } from '../application';

export class AboutWindow extends BrowserWindow {
  constructor(options: Pick<IWindowOptions, 'onClosed'>) {
    super({
      ...options,
      app: 'about',
      size: 'small',
      title: intl('about'),
    });
  }

  /**
   * Create the browser window.
   */
  static create() {
    /**
     * Don't create if the window exists.
     */
    if (windows.about) {
      windows.about.focus();
      windows.about.show();

      return;
    }

    windows.about = new AboutWindow({
      onClosed: () => {
        delete windows.about;
      },
    });
  }
}
