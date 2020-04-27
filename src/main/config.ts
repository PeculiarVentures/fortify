import * as fs from 'fs';
import { APP_CONFIG_FILE } from './const';

/**
 * Write config data to file
 *
 * @param path    Path to config file
 * @param config  Config data
 */
export function ConfigureWrite(path: string, config: IConfigure) {
  const json = JSON.stringify(config, null, '  ');
  fs.writeFileSync(path, json, { flag: 'w+' });
}

/**
 * Read config file by path
 *
 * @param path Path to file config
 * @param cb   Callback for configure creation
 */
export function ConfigureRead(path: string, cb?: () => IConfigure) {
  let res: IConfigure;
  if (!fs.existsSync(path)) {
    // Create config with default data
    if (cb) {
      res = cb();
    } else {
      res = {
        providers: [],
        cards: [],
      };
    }
    ConfigureWrite(APP_CONFIG_FILE, res);
  } else {
    const json = fs.readFileSync(APP_CONFIG_FILE, 'utf8');
    res = JSON.parse(json);
  }

  return res;
}
