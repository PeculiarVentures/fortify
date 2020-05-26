import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'app-header',
  styleUrl: 'app-header.scss',
})
export class AppHeader {
  render() {
    return (
      <Host>
        <p>
          Header
        </p>
      </Host>
    );
  }
}
