import { Component, h } from '@stencil/core';
import navigationMain from  '../../pages/navigationMain';
import { l10n } from '../../utils/l10n';
import { toLink } from '../../utils/toLink';

@Component({
  tag: 'app-footer',
  styleUrl: 'app-footer.scss',
})
export class AppFooter {
  private normalizeItems(items) {
    return Array.isArray(items) ? items : Object.entries(items);
  }

  renderFooter(mode: 'users' | 'developers' = 'users') {
    const items = [
      ...this.normalizeItems(navigationMain[mode].main),
      ...this.normalizeItems(navigationMain[mode].extra),
    ];

    return (
      <footer>
        <div class="max_width">
          <div class="info">
            <p class="copyright">
              {l10n.getString('footer.copyright')}
            </p>
            <ul>
              <li class="logo_item">
                <img
                  src="/assets/images/footer/lock.svg"
                  alt="Lock logo"
                  width="38"
                />
              </li>
              <li class="logo_item">
                <a
                  href="https://opensource.org/"
                  target="_blank"
                >
                  <img
                    src="/assets/images/footer/open_source.svg"
                    alt="Open source logo"
                    width="50"
                  />
                </a>
              </li>
            </ul>
          </div>

          <ul class="nav">
            {items.map(item => (
              <li
                key={item}
                class="nav_item"
              >
                {toLink(item)}
              </li>
            ))}
          </ul>
        </div>
      </footer>
    );
  }

  render() {
    return (
      <stencil-route-switch>
        <stencil-route
          url="/"
          exact={true}
        >
          {this.renderFooter()}
        </stencil-route>

        <stencil-route
          url="/developers"
          exact={true}
        >
          {this.renderFooter('developers')}
        </stencil-route>
        <stencil-route />
      </stencil-route-switch>
    );
  }
}
