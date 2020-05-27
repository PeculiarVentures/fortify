import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'landing-users-page',
  styleUrl: 'landing-page.scss',
})
export class LandingUsersPage {
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
