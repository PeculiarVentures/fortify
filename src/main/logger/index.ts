import * as winston from 'winston';
import { AnalyticsTransport } from './analytics_transport';
import { APP_LOG_FILE, isDevelopment } from '../constants';
import { getConfig } from '../config';

const config = getConfig();

const transportConsole = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf((info) => {
      const {
        level,
        message,
        source,
        ...other
      } = info;

      if (other && Object.keys(other).length) {
        return `${level}: [${source}]  ${message} ${JSON.stringify(other)}`;
      }

      return `${level}: [${source}]  ${message}`;
    }),
  ),
});

const transportFile = new winston.transports.File({
  filename: APP_LOG_FILE,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

const transportAnalytics = new AnalyticsTransport({
  userId: config.userId,
});

const winstonlogger = winston.createLogger({
  exitOnError: false,
  transports: [
    transportConsole,
    transportFile,
    transportAnalytics,
  ],
});

export const loggingSwitch = (enabled: boolean) => {
  if (isDevelopment) {
    transportConsole.silent = false;
    transportFile.silent = false;

    return;
  }

  if (enabled) {
    transportConsole.silent = false;
    transportFile.silent = false;
  } else {
    transportConsole.silent = true;
    transportFile.silent = true;
  }
};

export const loggingAnalyticsSwitch = (enabled: boolean) => {
  if (isDevelopment) {
    transportAnalytics.silent = true;

    return;
  }

  if (enabled) {
    transportAnalytics.silent = false;
  } else {
    transportAnalytics.silent = true;
  }
};

export default {
  log: (level: string, source: string, message: string, params: object = {}) => {
    winstonlogger.log(level, message, {
      source,
      ...params,
    });
  },
  info: (source: string, message: string, params: object = {}) => {
    winstonlogger.info(message, {
      source,
      ...params,
    });
  },
  error: (source: string, message: string, params: object = {}) => {
    winstonlogger.error(message, {
      source,
      ...params,
    });
  },
  warn: (source: string, message: string, params: object = {}) => {
    winstonlogger.warn(message, {
      source,
      ...params,
    });
  },
};
