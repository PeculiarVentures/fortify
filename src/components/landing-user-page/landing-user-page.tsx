import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'landing-user-page',
  styleUrl: 'landing-user-page.scss',
})
export class LandingUserPage {
  render() {
    return (
      <Host>
        Landing user page
        <br />
        <stencil-route-link url="/developers/docs/getting-started/overview">
          overview
        </stencil-route-link>
      </Host>
    );
  }
}
