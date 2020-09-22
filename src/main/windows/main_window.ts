import { BrowserWindow } from './window';
import { windows } from '../application';

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
}

export function CreateMainWindow() {
  windows.main = new MainWindow();
}
