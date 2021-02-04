import * as Mixpanel from 'mixpanel';
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

  constructor(options: IAnalyticsOptions) {
    this.userId = options.userId;
  }

  event(category: string, action: string, params: Record<string, any>) {
    mixpanel.track(action, {
      distinct_id: this.userId,
      category,
      ...params,
    });
  }
}
