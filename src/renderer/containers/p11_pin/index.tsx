import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WindowProvider from '../../components/window_provider';
import Container from './container';

class Root extends WindowProvider<{}, {}> {
  onApprove = (password: string) => {
    this.params.pin = password;
    this.close();
  };

  onReject = () => {
    this.params.pin = '';
    this.close();
  };

  renderChildrens() {
    return (
      <Container
        onApprove={this.onApprove}
        onReject={this.onReject}
        origin={this.params.origin}
      />
    );
  }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root'),
);
