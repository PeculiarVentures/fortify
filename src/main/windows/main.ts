import { windowSizes } from '../const';
import { CreateWindow } from './window';
import { windows } from '../application';

export function CreateMainWindow() {
  // Create the browser window.
  windows.main = CreateWindow({
    ...windowSizes.default,
    app: 'index',
    show: false,
  });

  // Emitted when the window is closed.
  windows.main.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // mainWindow = null
  });
}
