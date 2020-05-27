import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'landing-developers-page',
  styleUrl: 'landing-page.scss',
})
export class LandingDevelopersPage {
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