import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'landing-dev-page',
  styleUrl: 'landing-dev-page.scss',
})
export class LandingDevPage {
  render() {
    return (
      <Host>
        Landing dev page
        <br />
        <stencil-route-link url="/developers/docs/getting-started/overview">
          overview
        </stencil-route-link>
      </Host>
    );
  }
}
