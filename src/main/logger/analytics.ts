import * as Mixpanel from 'mixpanel';
import * as publicIp from 'public-ip';
import { MIXPANEL_TOKEN } from '../constants';

const mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

export interface IAnalyticsOptions {
  userId: string;
}

/**
 * https://www.npmjs.com/package/mixpanel
 */

export class Analytics {
  private userId: string;

  private userIp!: string;

  constructor(options: IAnalyticsOptions) {
    this.userId = options.userId;

    this.initIp();
  }

  private async initIp() {
    try {
      this.userIp = await publicIp.v4();
    } catch {
      //
    }
  }

  event(category: string, action: string, params: Record<string, any>) {
    mixpanel.track(action, {
      distinct_id: this.userId,
      ip: this.userIp,
      category,
      ...params,
    });
  }
}
