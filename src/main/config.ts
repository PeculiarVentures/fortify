import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG_FILE } from './constants';

const defaultConfig = {
  userId: uuidv4(),
  providers: [],
  cards: [],
  disableCardUpdate: false,
  logging: false,
  telemetry: true,
  locale: 'en',
};

/**
 * Set application config.
 * @param config  Config data
 */
export function setConfig(config: IConfigure) {
  const json = JSON.stringify(config, null, '  ');
  const parentDirname = path.dirname(APP_CONFIG_FILE);

  if (!fs.existsSync(parentDirname)) {
    fs.mkdirSync(parentDirname);
  }

  fs.writeFileSync(APP_CONFIG_FILE, json, { flag: 'w+' });
}

/**
 * Get application config.
 */
export function getConfig(): IConfigure {
  const isConfigExist = fs.existsSync(APP_CONFIG_FILE);

  if (isConfigExist) {
    const json = fs.readFileSync(APP_CONFIG_FILE, 'utf8');
    let config = JSON.parse(json) as IConfigure;

    // Add existing keys to config.
    if (Object.keys(defaultConfig).join('') !== Object.keys(config).join('')) {
      config = {
        ...defaultConfig,
        ...config,
      };

      setConfig(config);
    }

    return config;
  }

  // Save default config.
  setConfig(defaultConfig);

  return defaultConfig;
}
