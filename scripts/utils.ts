/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import * as childProcess from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import { stdout } from 'process';
import * as request from 'request';
import * as zip from 'extract-zip';
import 'colors';

const progress = require('request-progress');

export class Logger {
  public static info(message: string) {
    this.log(message.cyan);
  }

  public static debug(message: string) {
    this.log(message.gray);
  }

  public static error(error: string | Error) {
    if (typeof error === 'string') {
      this.log(error.red);
    } else {
      this.log(`${error.name}: ${error.message}`.red);
      this.debug(error.stack || '');
    }
  }

  public static log(message: string) {
    console.log(message);
  }
}

/**
 * Calls commands and print message about it to console
 * @param command
 * @param args
 * @param message
 */
export function spawn(command: string, args: string[] = []) {
  return new Promise((resolve, reject) => {
    Logger.debug(`> ${command} ${args.join(' ')}`);

    let item: childProcess.ChildProcess;
    if (os.platform() === 'win32') {
      item = childProcess.spawn(command, args, { stdio: 'inherit', shell: 'cmd' });
    } else {
      item = childProcess.spawn(command, args, { stdio: 'inherit', shell: 'bash' });
    }
    item
      .on('message', (msg) => {
        process.stdout.write(msg);
      })
      .on('close', (code) => {
        if (code) {
          reject(new Error(`Command finished with code ${code}`));
        } else {
          resolve();
        }
      })
      .on('error', reject);
  });
}

/**
 * Runs script and exits from program at the end
 * @param cb Script implementation
 */
export async function run(cb: () => Promise<void>) {
  try {
    await cb();

    process.exit(0);
  } catch (e) {
    Logger.error(e);
    process.exit(1);
  }
}

/**
 * Downloads file
 * @param url
 * @param dest
 */
export async function download(url: string, dest: string) {
  return new Promise((resolve, reject) => {
    Logger.debug(`Downloading ${url}`);

    progress(request(url)
      .on('response', (resp) => {
        if (resp.statusCode !== 200) {
          fs.unlinkSync(dest);
          reject(new Error(`${resp.statusMessage}(${resp.statusCode})`));
        }
      }))
      .on('progress', (state: any) => {
        // write percentage
        stdout.write(`Progress ${Math.floor(state.percent * 100)}%\r`.gray);
      })
      .on('error', reject)
      .on('end', () => {
        stdout.write('Progress 100%\n'.gray);
        resolve();
      })
      .pipe(fs.createWriteStream(dest));
  });
}

export async function extract(zipFile: string, absolutePath: string) {
  return new Promise((resolve, reject) => {
    zip(zipFile, { dir: absolutePath }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
