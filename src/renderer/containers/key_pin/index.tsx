import * as React from 'react';
import WindowProvider from '../../components/window_provider';
import Container from './container';

export class KeyPin extends WindowProvider<{}, {}> {
  onReject = () => {
    this.params.accept = false;
    this.close();
  };

  onApprove = () => {
    this.params.accept = true;
    this.close();
  };

  renderChildrens() {
    return (
      <Container
        onReject={this.onReject}
        onApprove={this.onApprove}
        origin={this.params.origin}
        pin={this.params.pin}
      />
    );
  }
}
