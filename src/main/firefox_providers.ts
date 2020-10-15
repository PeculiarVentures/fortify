import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import logger from './logger';

const create = () => {
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
    logger.info('firefox-providers', 'Cannot get default Firefox profiles folder for OS', {
      platform: os.platform(),
    });

    return providers;
  }

  if (!fs.existsSync(firefoxProfilesDir)) {
    logger.info('firefox-providers', 'Provider does not exist', {
      dir: firefoxProfilesDir,
    });

    return providers;
  }

  const profiles = fs.readdirSync(firefoxProfilesDir);

  // eslint-disable-next-line
  for (const profile of profiles) {
    const profileDir = path.join(firefoxProfilesDir, profile);
    // get pkcs11.txt file
    const pkcs11File = path.join(profileDir, 'pkcs11.txt');

    if (!fs.existsSync(pkcs11File)) {
      logger.info('firefox-providers', 'Cannot get pkcs11.txt', {
        dir: profileDir,
      });

      continue;
    }

    // get parameters from pkcs11.txt
    const pkcs11 = fs.readFileSync(pkcs11File, 'utf8');
    const params = /parameters=(.+)/g.exec(pkcs11);

    if (!params) {
      logger.info('firefox-providers', 'Cannot get parameters from pkcs11.txt');

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
};

export const firefoxProviders = {
  create,
};

export default firefoxProviders;
