import * as fs from 'fs';
import { APP_CONFIG_FILE } from './const';

/**
 * 
 * @typedef {Object} IConfigure
 * @property {boolean} [logging]
 */

/**
 * Read config file by path
 * 
 * @param {string} path Path to file config
 * @returns {IConfigure}
 */
export function ConfigureRead(path) {
  let res;
  if (!fs.existsSync(path)) {
    // Create config with default data
    res = {};
    ConfigureWrite(APP_CONFIG_FILE, res);
  } else {
    const json = fs.readFileSync(APP_CONFIG_FILE, 'utf8');
    res = JSON.parse(json);
  }
  return res;
}

/**
 * Write config data to file
 * 
 * @param {string}      path    Path to config file
 * @param {IConfigure}  config  Config data
 */
export function ConfigureWrite(path, config) {
  const json = JSON.stringify(config, null, '  ');
  fs.writeFileSync(path, json, { flag: 'w+' });
}
