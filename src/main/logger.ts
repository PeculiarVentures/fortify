import * as winston from 'winston';
import { APP_LOG_FILE } from './constants';

export const logger = winston.createLogger();

export const loggingSwitch = (enabled: boolean) => {
  if (enabled) {
    const options = { flag: 'w+' };

    winston.add(new winston.transports.File({ filename: APP_LOG_FILE, options }));
    winston.add(new winston.transports.Console());
  } else {
    winston.clear();
  }
};
