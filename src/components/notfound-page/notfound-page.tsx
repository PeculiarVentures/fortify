import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'notfound-page',
  styleUrl: 'notfound-page.scss',
  shadow: true,
})
export class NotfoundPage {
  render() {
    return (
      <Host>
        <div>
          <h1>Not Found</h1>
          <p>Sorry, we couldn't find that page.</p>
        </div>
      </Host>
    );
  }
}
