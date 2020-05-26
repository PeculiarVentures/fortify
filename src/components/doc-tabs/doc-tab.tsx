import { Component, h, Prop, Host } from '@stencil/core';

@Component({
  tag: 'doc-tab',
})
export class DocTab {
  @Prop({ reflectToAttr: true }) tab: string;

  @Prop({ reflectToAttr: true }) selected = false;

  render() {
    return (
      <Host role="tabpanel">
        <slot />
      </Host>
    );
  }
}
