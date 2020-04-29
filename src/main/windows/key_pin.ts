import { windowSizes } from '../const';
import { CreateWindow } from './window';

export function CreateKeyPinWindow(options: any) {
  // Create the browser window.
  const window = CreateWindow({
    ...windowSizes.default,
    app: 'key-pin',
    x: options.width - windowSizes.default.width,
    y: options.height - windowSizes.default.height,
    modal: true,
    alwaysOnTop: true,
    params: options.p,
  });

  window
    .on('ready-to-show', () => {
      window.focus();
    })
    .on('closed', () => {
      options.p.resolve(options.p.accept);
    });
}
