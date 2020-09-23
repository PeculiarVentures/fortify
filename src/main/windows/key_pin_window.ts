import { screen } from 'electron';
import { BrowserWindow, IWindowOptions } from './window';
import { intl } from '../locale';
import { windowSizes } from '../const';

interface IKeyPinWindowParams {
  params: {
    accept: boolean;
    resolve: (accept: boolean) => void;
    pin: string,
    origin: string,
  };
}

export class KeyPinWindow extends BrowserWindow {
  constructor(options: Pick<IWindowOptions, 'onClosed'> & IKeyPinWindowParams) {
    const { width, height } = screen.getPrimaryDisplay().bounds;

    super({
      ...options,
      size: 'default',
      app: 'key-pin',
      title: intl('key-pin'),
      windowOptions: {
        modal: true,
        alwaysOnTop: true,
        x: width - windowSizes.default.width,
        y: height - windowSizes.default.height,
      },
    });
  }

  /**
   * Create the browser window.
   */
  static create(options: IKeyPinWindowParams) {
    const window = new KeyPinWindow({
      onClosed: () => {
        options.params.resolve(options.params.accept);
      },
      ...options,
    });

    window.window.on('ready-to-show', () => {
      window.focus();
    });
  }
}
