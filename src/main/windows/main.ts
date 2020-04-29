import { windowSizes } from '../const';
import { CreateWindow } from './window';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

export function CreateMainWindow() {
  // Create the browser window.
  mainWindow = CreateWindow({
    ...windowSizes.default,
    app: 'index',
    show: false,
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // mainWindow = null
  });
}
