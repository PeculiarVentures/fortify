import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WindowProvider from '../../components/window_provider';
import Container from './container';
import { IntlProvider } from '../../components/intl';

class Root extends WindowProvider<{}, {}> {
  onApprove = (password: string) => {
    this.params.pin = password;
    this.close();
  };

  onReject = () => {
    this.params.pin = '';
    this.close();
  };

  render() {
    return (
      <IntlProvider>
        <Container
          onApprove={this.onApprove}
          onReject={this.onReject}
          origin={this.params.origin}
        />
      </IntlProvider>
    );
  }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root'),
);
