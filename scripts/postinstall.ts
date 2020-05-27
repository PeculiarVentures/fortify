/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'fs';
import * as os from 'os';
import {
  run, spawn, Logger, download, extract,
} from './utils';

async function macOS() {
  const nssUrl = 'https://github.com/PeculiarVentures/fortify/releases/download/binaries/nss-macos.zip';
  const pvpkcs11Url = 'https://github.com/PeculiarVentures/fortify/releases/download/binaries/libpvpkcs11.dylib';
  const pvpkcs11File = 'libpvpkcs11.dylib';
  const nssFolder = 'nss';

  if (!fs.existsSync(pvpkcs11File)) {
    await download(pvpkcs11Url, pvpkcs11File);
    Logger.info('pvpkcs11 library was downloaded');
  }

  if (!fs.existsSync(nssFolder)) {
    await download(nssUrl, 'nss.zip');
    try {
      await extract('nss.zip', `${__dirname}/../${nssFolder}`);
      Logger.info('NSS files were copied to nss folder\n');

      // Copy nss libs to electron
    } finally {
      fs.unlinkSync('nss.zip');
    }
  }

  await spawn('cp', ['nss/*', 'node_modules/electron/dist/Electron.app/Contents/MacOS/']);
  Logger.info('NSS file were copied to Electron folder\n');
}

async function win32() {
  throw new Error('Method not implemented');
}

async function linux() {
  throw new Error('Method not implemented');
}

async function main() {
  const platform = os.platform();
  Logger.debug(`Platform: ${platform}`);
  switch (platform) {
    case 'darwin':
      return macOS();
    case 'linux':
      return linux();
    case 'win32':
      return win32();
    default:
      throw new Error('Unsupported OS');
  }
}

run(main);
