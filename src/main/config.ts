import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG_FILE } from './constants';

const defaultConfig = {
  userId: uuidv4(),
  providers: [],
  cards: [],
  disableCardUpdate: false,
  logging: false,
  telemetry: false,
};

/**
 * Set application config.
 * @param config  Config data
 */
export function setConfig(config: IConfigure) {
  const json = JSON.stringify(config, null, '  ');

  fs.writeFileSync(APP_CONFIG_FILE, json, { flag: 'w+' });
}

/**
 * Get application config.
 */
export function getConfig(): IConfigure {
  const isConfigExist = fs.existsSync(APP_CONFIG_FILE);

  if (isConfigExist) {
    const json = fs.readFileSync(APP_CONFIG_FILE, 'utf8');
    const config = JSON.parse(json) as IConfigure;

    // Add `userId` key if exist.
    if (!config.userId) {
      config.userId = uuidv4();

      // Save config with new keys.
      setConfig(config);
    }

    return config;
  }

  // Save default config.
  setConfig(defaultConfig);

  return defaultConfig;
}
