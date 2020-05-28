import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'landing-developers-page',
  styleUrl: 'landing-page.scss',
})
export class LandingDevelopersPage {
  render() {
    return (
      <Host class="landing_page">
        <section class="preview">
          <div class="max_width">
            <div class="content">
              <h2>
                Fortify makes it easy for you to build modern web applications that use smart cards and local certificates.
              </h2>
              <stencil-route-link
                url="/developers/docs/getting-started/overview"
                class="button_primary button"
              >
                Get started
              </stencil-route-link>
            </div>
          </div>
        </section>

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

        <section class="using" id="using">
          <div class="max_width">
            <h2>
              Using it is easy
            </h2>

            <div class="content">
              <iframe height="400" style={{ width: '100%' }} scrolling="no" title="Certificate viewer" src="https://codepen.io/donskov/embed/preview/RwPqLLa?height=400&theme-id=light&default-tab=result" frameborder="no" allowtransparency="true" allowfullScreen="true">
                See the Pen <a href='https://codepen.io/donskov/pen/RwPqLLa'>Certificate viewer</a> by Dmitriy Donskov
                (<a href='https://codepen.io/donskov'>@donskov</a>) on <a href='https://codepen.io'>CodePen</a>.
              </iframe>
            </div>
          </div>
        </section>

        <section class="support" id="support">
          <div class="max_width">
            <div class="container">
              <div class="support_part">
                <h2>
                  Support
                </h2>

                <md-viewer
                  path="/pages/support/en/index.json"
                  class="content"
                />
              </div>

              <div class="subscribe_part">
                <h2>
                  Subscribe to be aware of recent updates
                </h2>

                <form class="form">
                  <input
                    type="email"
                    placeholder="Email"
                    disabled
                    class="input_email"
                  />
                  <button
                    disabled
                    class="button_primary button"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
