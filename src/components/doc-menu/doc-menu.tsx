import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'doc-menu',
  styleUrl: 'doc-menu.scss',
})
export class DocMenu {
  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
