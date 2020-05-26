import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'doc-tab',
})
export class DocTab {
  @Prop({ reflectToAttr: true }) tab: string;

  @Prop({ reflectToAttr: true }) selected = false;

  hostData() {
    return {
      role: 'tabpanel',
    };
  }

  render() {
    return <slot/>;
  }
}
