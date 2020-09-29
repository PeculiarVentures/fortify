import * as fs from 'fs';
import { APP_CONFIG_FILE } from './constants';

/**
 * Write config data to file
 *
 * @param path    Path to config file
 * @param config  Config data
 */
export function setConfig(config: IConfigure) {
  const json = JSON.stringify(config, null, '  ');

  fs.writeFileSync(APP_CONFIG_FILE, json, { flag: 'w+' });
}

/**
 * Read config file by path
 *
 * @param path Path to file config
 * @param cb   Callback for configure creation
 */
export function getConfig() {
  let res: IConfigure;

  if (!fs.existsSync(APP_CONFIG_FILE)) {
    // Create config with default data
    res = {
      providers: [],
      cards: [],
      disableCardUpdate: false,
      logging: false,
    };

    setConfig(res);
  } else {
    const json = fs.readFileSync(APP_CONFIG_FILE, 'utf8');

    res = JSON.parse(json);
  }

  return res;
}
