import * as electron from 'electron';
import * as React from 'react';
import * as winston from 'winston';

winston.add(new winston.transports.Console());

export default class WindowProvider<P, S> extends React.Component<P, S> {
  public params: Assoc<any>;

  constructor(props: P) {
    super(props);

    const $window = electron.remote.getCurrentWindow() as any;

    this.params = $window.params || {};
  }

  protected onClose(...args: any[]) {
    console.log(args);
  }

  close = (...args: any[]) => {
    this.onClose(...args);
    electron.remote.getCurrentWindow().close();
  };
}
