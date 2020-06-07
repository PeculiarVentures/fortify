import { setEngine } from '2key-ratchet';
import * as wsServer from '@webcrypto-local/server';
import * as electron from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as winston from 'winston';

import { ConfigureRead } from './config';
import { APP_CONFIG_FILE, APP_LOG_FILE, APP_USER_DIR } from './const';
import './crypto';
import { BrowserWindowEx } from './windows';

const LOG_DEFAULT_PROVIDERS_ADD = 'Default:Providers:Add::';

if (!fs.existsSync(APP_USER_DIR)) {
  fs.mkdirSync(APP_USER_DIR);
}

export let server: wsServer.LocalServer;
export const configure = ConfigureRead(APP_CONFIG_FILE, initConfig);
export const windows: Assoc<BrowserWindowEx> = {};

function initConfig() {
  const config: IConfigure = {
    providers: [],
    cards: [],
    disableCardUpdate: false,
    proxy: '',
  };

  try {
    const firefoxProviders = createFirefoxProviders();
    config.providers = config.providers!.concat(firefoxProviders);
  } catch (err) {
    winston.error(err.stack);
  }

  return config;
}

/**
 * Turn on/of logger
 *
 * @param enabled
 */
export function LoggingSwitch(enabled: boolean) {
  if (enabled) {
    const options = { flag: 'w+' };
    // if (!fs.existsSync(APP_LOG_FILE)) {
    //     fs.writeFileSync(APP_LOG_FILE, "", options);
    // }
    winston.add(new winston.transports.File({ filename: APP_LOG_FILE, options }));
    winston.add(new winston.transports.Console());
  } else {
    winston.clear();
  }
}

LoggingSwitch(!!configure.logging);

export function load(options: wsServer.IServerOptions) {
  setEngine('@peculiar/webcrypto', (global as any).crypto);
  fillPvPKCS11(options);
  server = new wsServer.LocalServer(options);
}

function fillPvPKCS11(options: wsServer.IServerOptions) {
  if (!options.config.pvpkcs11) {
    options.config.pvpkcs11 = [];
  }

  switch (os.platform()) {
    case 'win32':
      options.config.pvpkcs11.push(path.normalize(`${process.execPath}/../pvpkcs11.dll`));
      break;
    case 'darwin':
      options.config.pvpkcs11.push(path.join(__dirname, '..', 'libpvpkcs11.dylib'));
      break;
    default:
    // nothing
  }
}

function createFirefoxProviders() {
  const providers: IConfigureProvider[] = [];
  // Get User's Firefox profile
  let firefoxProfilesDir = '';
  let lib = '';
  switch (os.platform()) {
    case 'win32': {
      firefoxProfilesDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Mozilla', 'Firefox', 'Profiles');
      lib = path.normalize(`${process.execPath}/../softokn3.dll`);
      break;
    }
    case 'linux': {
      firefoxProfilesDir = path.join(os.homedir(), '.mozilla', 'firefox');
      lib = '/usr/lib/x86_64-linux-gnu/nss/libsoftokn3.so';
      break;
    }
    case 'darwin': {
      firefoxProfilesDir = path.join(os.homedir(), 'Library', 'Application Support', 'Firefox', 'Profiles');
      lib = path.normalize(`${process.execPath}/../libsoftokn3.dylib`);
      break;
    }
    default:
    // nothing
  }

  if (!firefoxProfilesDir) {
    winston.info(`${LOG_DEFAULT_PROVIDERS_ADD} Cannot get default Firefox profiles folder for OS '${os.platform()}'`);

    return providers;
  }
  if (!fs.existsSync(firefoxProfilesDir)) {
    winston.info(`${LOG_DEFAULT_PROVIDERS_ADD} ${firefoxProfilesDir} does not exist`);

    return providers;
  }

  const profiles = fs.readdirSync(firefoxProfilesDir);

  // eslint-disable-next-line
  for (const profile of profiles) {
    const profileDir = path.join(firefoxProfilesDir, profile);

    // get pkcs11.txt file
    const pkcs11File = path.join(profileDir, 'pkcs11.txt');
    if (!fs.existsSync(pkcs11File)) {
      winston.info(`${LOG_DEFAULT_PROVIDERS_ADD} Cannot get pkcs11.txt from ${profileDir}`);
      continue;
    }
    // get parameters from pkcs11.txt
    const pkcs11 = fs.readFileSync(pkcs11File, 'utf8');
    const params = /parameters=(.+)/g.exec(pkcs11);
    if (!params) {
      winston.info(`${LOG_DEFAULT_PROVIDERS_ADD} Cannot get parameters from pkcs11.txt`);
      continue;
    }

    const provider: IConfigureProvider = {
      lib,
      slots: [1],
      libraryParameters: params[1],
      name: 'Firefox NSS',
    };

    providers.push(provider);
  }

  return providers;
}

export function quit() {
  if (server) {
    server.close(() => {
      electron.app.exit();
    });
  } else {
    electron.app.exit();
  }
}
