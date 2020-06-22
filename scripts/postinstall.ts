/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  run, spawn, Logger, download, extract,
} from './utils';

const solutionFolder = path.join(__dirname, '..');
const nssFolder = path.join(solutionFolder, 'nss');
const openscFolder = path.join(nssFolder, 'opensc');

async function macOS() {
  const nssUrl = 'https://github.com/PeculiarVentures/fortify/releases/download/binaries/nss-macos.zip';
  const openscUrl = 'https://github.com/PeculiarVentures/fortify/releases/download/binaries/opensc-macos.zip';
  const pvpkcs11Url = 'https://github.com/PeculiarVentures/fortify/releases/download/binaries/libpvpkcs11.dylib';
  const pvpkcs11File = 'libpvpkcs11.dylib';
  const nssUtilsFolder = path.join(nssFolder, 'utils');

  if (!fs.existsSync(pvpkcs11File)) {
    await download(pvpkcs11Url, pvpkcs11File);
    Logger.info('pvpkcs11 library was downloaded');
  }

  if (!fs.existsSync(nssFolder)) {
    fs.mkdirSync(nssFolder);
    Logger.info(`Folder '${nssFolder}' created`);
  }
  if (!fs.existsSync(nssUtilsFolder)) {
    fs.mkdirSync(nssUtilsFolder);
    Logger.info(`Folder '${nssUtilsFolder}' created`);

    const nssZip = `${nssUtilsFolder}/nss.zip`;
    await download(nssUrl, nssZip);
    try {
      await extract(nssZip, nssUtilsFolder);
      Logger.info('NSS files were copied to nss folder');
    } finally {
      fs.unlinkSync(nssZip);
    }
  }

  await spawn('cp', [`${nssUtilsFolder}/*`, 'node_modules/electron/dist/Electron.app/Contents/MacOS/']);
  Logger.info('NSS files were copied to Electron folder');

  if (!fs.existsSync(openscFolder)) {
    fs.mkdirSync(openscFolder);
    Logger.info(`Folder '${openscFolder}' created`);

    const openscZip = `${openscFolder}/opensc.zip`;
    await download(openscUrl, openscZip);
    try {
      await extract(openscZip, openscFolder);
      Logger.info('OpenSC files were copied to nss folder');
    } finally {
      fs.unlinkSync(openscZip);
    }
  }

  const macOsFolder = path.join(__dirname, '../node_modules/electron/dist/Electron.app/Contents/MacOS');
  await spawn('cp', [`${openscFolder}/*`, `${macOsFolder}/`]);
  Logger.info('OpenSC files were copied to Electron folder');
  await spawn('install_name_tool', [
    '-change',
    'libopensc.6.dylib',
    path.join(macOsFolder, 'libopensc.6.dylib'),
    path.join(macOsFolder, 'opensc-pkcs11.so'),
  ]);
}

async function win32() {
  // copy pvpkcs11
  const pvpkcs11Url = 'https://github.com/PeculiarVentures/fortify/releases/download/binaries/pvpkcs11-win32-x64.dll';
  const pvpkcs11File = 'pvpkcs11.dll';
  const nssUtilsUrl = 'https://github.com/PeculiarVentures/fortify/releases/download/binaries/nss-certutil-win32-x64.zip';
  const nssRuntimeUrl = 'https://github.com/PeculiarVentures/fortify/releases/download/binaries/nss-runtime-win32-x64.zip';
  const nssDir = 'nss';
  const nssUtilsDir = path.join(nssDir, 'utils');
  const nssRuntimeDir = path.join(nssDir, 'runtime');

  if (!fs.existsSync(pvpkcs11File)) {
    await download(pvpkcs11Url, pvpkcs11File);
    Logger.info('pvpkcs11 library was downloaded');
  }

  if (!fs.existsSync(nssDir)) {
    // Create nss
    fs.mkdirSync(nssDir);
    Logger.debug(`${nssDir} folder was created`);

    // eslint-disable-next-line no-inner-declarations
    async function downloadUnzip(url: string, target: string) {
      // Download and extract files
      const zip = path.join(nssDir, 'tmp.zip');
      await download(url, zip);
      try {
        if (!fs.existsSync(target)) {
          fs.mkdirSync(target);
          Logger.debug(`${target} folder was created`);
        }
        await extract(zip, path.join(__dirname, '..', target));
        Logger.info(`Files were downloaded and extracted to ${target} folder`);
      } finally {
        fs.unlinkSync(zip);
      }
    }

    // NSS utils
    if (!fs.existsSync(nssUtilsDir)) {
      await downloadUnzip(nssUtilsUrl, nssUtilsDir);
    }

    // NSS runtime
    if (!fs.existsSync(nssRuntimeDir)) {
      await downloadUnzip(nssRuntimeUrl, nssRuntimeDir);
    }
  }

  await spawn('xcopy', ['pvpkcs11.dll', path.normalize('node_modules/electron/dist'), '/R', '/Y']);
  Logger.info('pvpkcs11 was copied to electron folder');

  await spawn('xcopy', [path.join(nssUtilsDir, '*'), path.normalize('node_modules/electron/dist/resources'), '/R', '/Y']);
  Logger.info('NSS util files were copied to electron folder');

  await spawn('xcopy', [path.join(nssRuntimeDir, '*'), path.normalize('node_modules/electron/dist'), '/R', '/Y']);
  Logger.info('NSS runtime file were copied to electron folder');

  if (!fs.existsSync(openscFolder)) {
    fs.mkdirSync(openscFolder);
    Logger.info(`Folder '${openscFolder}' created`);

    const openscZip = `${openscFolder}/opensc.zip`;
    await download("https://github.com/PeculiarVentures/fortify/releases/download/binaries/opensc-win32-x64.zip", openscZip);
    try {
      await extract(openscZip, openscFolder);
      Logger.info('OpenSC files were copied to nss folder');
    } finally {
      fs.unlinkSync(openscZip);
    }
  }

  const electronFolder = path.join(__dirname, '../node_modules/electron/dist');
  await spawn('xcopy', [path.join(openscFolder, '*'), electronFolder, '/R', '/Y']);
  Logger.info('OpenSC files were copied to Electron folder');
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
