import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import logger from '../../logger';

export class Firefox {
  public static profiles() {
    const homeFolder = os.homedir();
    let profilesFolder: string | undefined;
    switch (os.platform()) {
      case 'win32':
        profilesFolder = path.normalize(`${homeFolder}/AppData/Roaming/Mozilla/Firefox/Profiles`);
        break;
      case 'linux':
        profilesFolder = path.normalize(`${homeFolder}/.mozilla/firefox`);
        break;
      case 'darwin':
        profilesFolder = path.normalize(`${homeFolder}/Library/Application Support/Firefox/Profiles`);
        break;
      default:
        throw new Error('Cannot get Firefox profile. Unsupported Operation System');
    }

    const res: string[] = [];
    if (fs.existsSync(profilesFolder)) {
      const profiles = fs.readdirSync(profilesFolder);
      // eslint-disable-next-line no-restricted-syntax
      for (const profile of profiles) {
        if (/default/.test(profile)) {
          const profileFolder = path.normalize(path.join(profilesFolder, profile));
          res.push(profileFolder);
        }
      }
    } else {
      logger.info('firefox', 'Profiles folder does not exist', { path: profilesFolder });
    }

    return res;
  }

  public static restart() {
    switch (os.platform()) {
      case 'win32':
        execSync('taskkill /F /IM firefox.exe');
        execSync('start firefox');
        break;
      case 'linux':
        execSync('pkill firefox');
        execSync('firefox&');
        break;
      case 'darwin':
        execSync('pkill firefox');
        execSync('open /Applications/Firefox.app');
        break;
      default:
        throw new Error();
    }
  }
}
