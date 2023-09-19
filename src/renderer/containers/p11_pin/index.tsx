import * as React from 'react';
import WindowProvider from '../../components/window_provider';
import Container from './container';

export class P11Pin extends WindowProvider<{}, {}> {
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
