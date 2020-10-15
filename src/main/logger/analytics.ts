import * as ua from 'universal-analytics';

interface IEvent {
  userId: string;
  category: string;
  action: string;
  timestamp: number;
  params?: Object;
}

/**
 * https://www.npmjs.com/package/universal-analytics
 */

export class Analytics {
  // private queue: IEvent[] = [];

  private visitor: ua.Visitor;

  constructor(accountId: string, userId: string) {
    console.log(userId);

    this.visitor = ua(accountId, {
      uid: userId,
    });
  }

  // private enqueue(category: string, action: string, params?: Object) {
  //   this.queue.push({
  //     // userId: this.userId,
  //     category,
  //     action,
  //     timestamp: new Date().getTime(),
  //     params,
  //   });
  // }

  // private resetQueue() {
  //   this.queue = [];
  // }

  // getQueue() {
  //   return this.queue;
  // }

  event(category: string, action: string, label: string, params: Object = {}) {
    // this.enqueue(category, action, params);

    // console.log(this.accountId, this.userId, category, action, params);
    // console.log('=========');
    // console.log(params);


    this.visitor.event(category, action, label, '', params).send();

    // visitor.event(category, action, '', '', params).send();

    // return this;
  }

  // TODO: Add service for send events.
  // send() {
  //   console.log('queue send:', this.getQueue());

  //   this.resetQueue();
  // }
}
