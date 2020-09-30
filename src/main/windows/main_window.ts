import { BrowserWindow } from './window';
import { windows } from './list';

export class MainWindow extends BrowserWindow {
  constructor() {
    super({
      app: 'index',
      size: 'default',
      title: '',
      onClosed: () => {},
      windowOptions: {
        show: false,
      },
    });
  }

  /**
   * Create the browser window.
   */
  static create() {
    /**
     * Don't create if the window exists.
     */
    if (windows.main) {
      return;
    }

    windows.main = new MainWindow();
  }
}
