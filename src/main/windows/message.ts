import * as winston from 'winston';
import { windowSizes } from '../const';
import { intl } from '../locale';
import { CreateWindow } from './window';
import { DialogsStorage } from '../app_windows';

/**
 *
 * @param text
 * @param options
 * @param cb
 * @return {BrowserWindow}
 */
export function CreateQuestionWindow(
  text: string,
  options: ICreateWindowOptions,
  cb?: (result: number) => void,
) {
  if (options.id && options.showAgain && DialogsStorage.hasDialog(options.id)) {
    winston.info(`Don't show dialog '${options.id}'. It's disabled`);

    return null;
  }

  // Create the browser window.
  const window = CreateWindow({
    ...windowSizes.small,
    app: 'message',
    title: options.title || intl('question'),
    center: true,
    modal: !!options.parent,
    parent: options.parent,
    dock: options.parent ? false : options.dock,
    params: {
      type: 'question',
      text,
      result: 0,
      id: options.id,
      showAgain: options.showAgain,
      showAgainValue: false,
    },
  });

  // Emitted when the window is closed.
  window.on('closed', () => {
    DialogsStorage.onDialogClose(window as any);

    if (cb) {
      cb(window.params.result);
    }
  });

  return window;
}

/**
 *
 * @param text
 * @param options
 * @param cb
 * @return {BrowserWindow}
 */
export function CreateTokenWindow(
  text: string,
  options: ICreateWindowOptions,
  cb?: (result: number) => void,
) {
  if (options.id && options.showAgain && DialogsStorage.hasDialog(options.id)) {
    winston.info(`Don't show dialog '${options.id}'. It's disabled`);

    return null;
  }

  // Create the browser window.
  const window = CreateWindow({
    ...windowSizes.small,
    app: 'message',
    title: options.title || intl('question'),
    center: true,
    modal: !!options.parent,
    parent: options.parent,
    dock: options.parent ? false : options.dock,
    params: {
      type: 'token',
      text,
      result: 0,
      id: options.id,
      showAgain: options.showAgain,
      showAgainValue: false,
    },
  });

  // Emitted when the window is closed.
  window.on('closed', () => {
    DialogsStorage.onDialogClose(window as any);

    if (cb) {
      cb(window.params.result);
    }
  });

  return window;
}
