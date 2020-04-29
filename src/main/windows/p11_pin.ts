import * as wsServer from '@webcrypto-local/server';
import { windowSizes } from '../const';
import { intl } from '../locale';
import { CreateWindow } from './window';

export function CreateP11PinWindow(options: any) {
  // Create the browser window.
  const window = CreateWindow({
    ...windowSizes.small,
    app: 'p11-pin',
    title: intl('p11-pin'),
    alwaysOnTop: true,
    params: options.p,
  });

  options.p.pin = '';

  window
    .on('ready-to-show', () => {
      window.focus();
    })
    .on('closed', () => {
      if (options.p.pin) {
        options.p.resolve(options.p.pin);
      } else {
        options.p.reject(new wsServer.WebCryptoLocalError(10001, 'Incorrect PIN value. It cannot be empty.'));
      }
    });
}
