import * as winston from 'winston';
import { AnalyticsTransport } from './analytics_transport';
import { APP_LOG_FILE, isDevelopment } from '../constants';

// const transportConsole = new winston.transports.Console({
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.printf((info) => {
//       const {
//         level,
//         message,
//         source,
//         ...other
//       } = info;

//       if (other && Object.keys(other).length) {
//         return `${level}: [${source}]  ${message} ${JSON.stringify(other)}`;
//       }

//       return `${level}: [${source}]  ${message}`;
//     }),
//   ),
// });

// const transportFileGet = () => new winston.transports.File({
//   filename: APP_LOG_FILE,
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json(),
//   ),
// });

const winstonlogger = winston.createLogger({
  exitOnError: false,
});

export const loggingSwitch = (enabled: boolean) => {
  winstonlogger.clear();

  if (isDevelopment || enabled) {
    // winstonlogger.add(transportConsole);
  }

  if (enabled) {
    // winstonlogger.add(transportFileGet());
  }

  winstonlogger.add(new AnalyticsTransport());
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
