import * as winston from 'winston';
import { APP_LOG_FILE, isDevelopment } from './constants';

const transportConsole = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.padLevels(),
    winston.format.simple(),
  ),
});

const transportFileGet = () => new winston.transports.File({
  filename: APP_LOG_FILE,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

export const logger = winston.createLogger({
  exitOnError: false,
});

export const loggingSwitch = (enabled: boolean) => {
  logger.clear();

  if (isDevelopment || enabled) {
    logger.add(transportConsole);
  }

  if (enabled) {
    logger.add(transportFileGet());
  }
};
