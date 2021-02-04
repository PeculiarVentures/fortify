import * as Transport from 'winston-transport';
import { Analytics, IAnalyticsOptions } from './analytics';

export class AnalyticsTransport extends Transport {
  analytics: Analytics;

  constructor(options: IAnalyticsOptions & Transport.TransportStreamOptions) {
    super(options);

    this.analytics = new Analytics(options);
  }

  log(info: any, callback: () => void) {
    const {
      level,
      source,
      message,
      ...other
    } = info;

    this.analytics.event(source, message, other);

    this.emit('logged', info);

    if (callback) {
      callback();
    }
  }
}
