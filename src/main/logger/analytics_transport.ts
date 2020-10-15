import * as Transport from 'winston-transport';
import { Analytics } from './analytics';

const analytics = new Analytics('UA-180537591-1', 'as8eknlll');

export class AnalyticsTransport extends Transport {
  // constructor(opts) {
  //   super(opts);
  // }

  log(info: any, callback: () => void) {
    const { level, source, message, ...other } = info;

    // const x = this.format(info);

    // this.emit('logged', info);

    // console.log('!!!!');
    // console.log(level);
    // console.log(source);
    // console.log(message);
    // console.log(other);
    // console.log(Object.keys(other));
    analytics.event(source, message, level, other);

    this.emit('logged', info);

    if (callback) {
      callback();
    }
  }
}
