import { Component, h, Prop, ComponentInterface } from '@stencil/core';

@Component({
  tag: 'doc-page',
  styleUrl: 'doc-page.scss',
})
export class DocPage implements ComponentInterface {
  @Prop() path?: string;

  render() {
    return (
      <md-viewer
        path={this.path}
        showTitle={true}
        notFound={(
          <div>
            <h1>Not Found</h1>
            <p>Sorry, we couldn't find that page.</p>
          </div>
        )}
      />
    );
  }
}
