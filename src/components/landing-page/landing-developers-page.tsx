import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'landing-developers-page',
  styleUrl: 'landing-page.scss',
})
export class LandingDevelopersPage {
  render() {
    return (
      <Host class="landing_page">
        <section class="features" id="features">
          <div class="max_width">
            <ul class="list">
              <li class="list_item">
                <img
                  src="/assets/images/features/image_1.svg"
                  class="image"
                />
                <h4>
                  Simple to use
                </h4>
                <p>
                  No new API to use. Just instantiate the Fortify-WebCrypto implementation and your existing WebCrypto based code will work.
                </p>
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/features/image_2.svg"
                  class="image"
                />
                <h4>
                  Cross Platform
                </h4>
                <p>
                  Works on all major operating systems including Windows, MacOS, Linux and browsers including Chrome, Safari, Firefox, Edge, and Internet Explorer to use the computers and browsers they know and love.
                </p>
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/features/image_3.svg"
                  class="image"
                />
                <h4>
                  Local Certificates and Smart Cards
                </h4>
                <p>
                Works with users existing certificates in stored in the operating system or browser certificate stores and their smart cards.
                </p>
              </li>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
