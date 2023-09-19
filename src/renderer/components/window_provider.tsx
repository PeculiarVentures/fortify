import * as React from 'react';
import { IntlProvider } from './intl';
import DocumentTitle from './document_title';

export default abstract class WindowProvider<P, S> extends React.Component<P, S> {
  public params: Record<string, any>;

  constructor(props: P) {
    super(props);

    const searchParams = new URLSearchParams(window.location.search);
    this.params = Object.fromEntries(searchParams);
  }

  // eslint-disable-next-line class-methods-use-this
  protected onClose(...args: any[]) {
    console.log(args);
  }

  close = (...args: any[]) => {
    this.onClose(...args);

    window.electronAPI.closeWindow();
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
