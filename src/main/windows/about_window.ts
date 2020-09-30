import { BrowserWindow, IWindowOptions } from './window';
import { l10n } from '../../_main/l10n';
import { windows } from '../../_main/windows';

export class AboutWindow extends BrowserWindow {
  constructor(options: Pick<IWindowOptions, 'onClosed'>) {
    super({
      ...options,
      app: 'about',
      size: 'small',
      title: l10n.get('about'),
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
