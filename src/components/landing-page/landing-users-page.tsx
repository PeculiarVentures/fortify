import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'landing-users-page',
  styleUrl: 'landing-page.scss',
})
export class LandingUsersPage {
  render() {
    return (
      <Host class="landing_page">
        <section class="preview">
          <div class="max_width">
            <div class="content">
              <h2>
                Fortify enables cross-browser usage of local certificates and smart cards
              </h2>
              <p class="description">
                Avaliable for macOS, Windows 7 and later Browsers IE 11, Edge, Safari, and Chrome
              </p>
              <a
                href="#download"
                class="button"
              >
                Download App
              </a>
            </div>
          </div>
        </section>

        <section class="features" id="what-it-does">
          <div class="max_width">
            <h2>
              What does Fortify do?
            </h2>
            <ul class="list">
              <li class="list_item">
                <img
                  src="/assets/images/what_it_does/image_1.svg"
                />
                <p>
                  Use your smart card or security token that has already been enrolled with a certificate with web applications.
                </p>
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/what_it_does/image_2.svg"
                />
                <p>
                  Enroll for a new certificate or renew an existing one.
                </p>
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/what_it_does/image_3.svg"
                />
                <p>
                  Build applications that can sign/verify or encrypt/decrypt using locally installed certificates, smart cards or security tokens.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section class="download" id="download">
          <div class="max_width">
            <h2>
              Download App
            </h2>
            <ul class="list">
              <li class="list_item">
                <a
                  href="/"
                  class="link"
                >
                  <img
                    src="/assets/images/download/osx.svg"
                    alt="OSX icon"
                    class="image"
                    width="50"
                  />
                  <div>
                    <h5>
                      Download for Mac
                    </h5>
                    <p class="description">
                      macOS 10.9 and later
                    </p>
                  </div>
                </a>
              </li>
              <li class="list_item">
                <a
                  href="/"
                  class="link"
                >
                  <img
                    src="/assets/images/download/windows.svg"
                    alt="Windows icon"
                    class="image"
                    width="50"
                  />
                  <div>
                    <h5>
                      Download for Windows (x64)
                    </h5>
                    <p class="description">
                      Windows 7 and later
                    </p>
                  </div>
                </a>
              </li>
              <li class="list_item">
                <a
                  href="/"
                  class="link"
                >
                  <img
                    src="/assets/images/download/windows.svg"
                    alt="Windows icon"
                    class="image"
                    width="50"
                  />
                  <div>
                    <h5>
                      Download for Windows (x86)
                    </h5>
                    <p class="description">
                      Windows 7 and later
                    </p>
                  </div>
                </a>
              </li>
              <li class="list_item">
                <a
                  href="/"
                  class="link"
                >
                  <img
                    src="/assets/images/download/linux.svg"
                    alt="Linux icon"
                    class="image"
                    width="50"
                  />
                  <div>
                    <h5>
                      Download for Linux (x64)
                    </h5>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section class="guides" id="guides">
          <div class="max_width">
            <h2>
              Guides
            </h2>

            <md-viewer
              path="/pages/guides/en/macos.json"
            />
          </div>
        </section>

        <section class="faq" id="faq">
          <div class="max_width">
            <h2>
              Frequently asked questions
            </h2>
            <md-viewer
              path="/pages/faq/en/index.json"
              class="content"
            />
          </div>
        </section>

        <section class="companies">
          <div class="max_width">
            <h2>
              Trusted by
            </h2>
            <ul class="list">
              <li class="list_item">
                <img
                  src="/assets/images/companies/logo_1.png"
                  class="image"
                  width="150"
                />
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/companies/logo_2.png"
                  class="image"
                  width="116"
                />
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/companies/logo_3.png"
                  class="image"
                  width="111"
                />
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/companies/logo_4.png"
                  class="image"
                  width="125"
                />
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/companies/logo_5.png"
                  class="image"
                  width="102"
                />
              </li>
              <li class="list_item">
                <img
                  src="/assets/images/companies/logo_6.png"
                  class="image"
                  width="115"
                />
              </li>
            </ul>
          </div>
        </section>
      </Host>
    );
  }
}
