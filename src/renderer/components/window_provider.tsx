import { remote } from 'electron';
import * as React from 'react';
import * as winston from 'winston';
import { IntlProvider } from './intl';
import DocumentTitle from './document_title';

winston.add(new winston.transports.Console());

export default abstract class WindowProvider<P, S> extends React.Component<P, S> {
  public params: Assoc<any>;

  constructor(props: P) {
    super(props);

    this.params = (remote.getCurrentWindow() as any).params || {};
  }

  // eslint-disable-next-line class-methods-use-this
  protected onClose(...args: any[]) {
    console.log(args);
  }

  close = (...args: any[]) => {
    this.onClose(...args);

    remote.getCurrentWindow().close();
  };

  abstract renderChildrens(): JSX.Element;

  render() {
    return (
      <IntlProvider>
        <DocumentTitle
          titleKey={this.params.titleKey}
        />
        {this.renderChildrens()}
      </IntlProvider>
    );
  }
}
