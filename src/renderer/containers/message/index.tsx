import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WindowProvider from '../../components/window_provider';
import Container from './container';
import { IntlProvider } from '../../components/intl';

class Root extends WindowProvider<{}, {}> {
  onApprove = () => {
    this.params.result = 1;
    this.close();
  };

  onClose = (showAgain?: boolean) => {
    if (this.params.id && this.params.showAgain) {
      this.params.showAgainValue = showAgain;
    }
  };

  render() {
    return (
      <IntlProvider>
        <Container
          type={this.params.type}
          text={this.params.text}
          onClose={this.close}
          onApprove={this.onApprove}
          hasShowAgain={this.params.id && this.params.showAgain}
          textClose={this.params.buttonLabel}
        />
      </IntlProvider>
    );
  }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root'),
);
