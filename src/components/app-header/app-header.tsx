import { Component, h } from '@stencil/core';
import { toLink } from '../../utils/toLink';
import { l10n } from '../../utils/l10n';
import navigationMain from  '../../pages/navigationMain';

@Component({
  tag: 'app-header',
  styleUrl: 'app-header.scss',
})
export class AppHeader {
  private normalizeItems(items) {
    return Array.isArray(items) ? items : Object.entries(items);
  }

  renderHeaderNav(mode: 'users' | 'developers' = 'users') {
    const items = [
      this.normalizeItems(navigationMain[mode].main),
      this.normalizeItems(navigationMain[mode].extra),
    ];

    return [
      <stencil-route-link
        url={mode == 'developers' ? '/developers' : '/'}
        exact={true}
        class="link_logo"
      >
        <img
          src="/assets/images/logo.svg"
          alt="Fortify logo"
          class="logo"
        />
      </stencil-route-link>,
      <ul class="nav_main">
        {items[0].map(item => (
          <li
            key={item}
            class="nav_item"
          >
            {toLink(item)}
          </li>
        ))}
      </ul>,
      <ul class="nav_extra">
        {items[1].map(item => (
          <li
            key={item}
            class="nav_item"
          >
            {toLink(item)}
          </li>
        ))}
      </ul>,
    ];
  }

  onChangeLocale = (e: any) => {
    l10n.setLocale(e.target.value);

    window.location.reload();
  }

  render() {
    return (
      <header>
        <stencil-route-switch>
          <stencil-route
            url="/"
            exact={true}
          >
            {this.renderHeaderNav()}
          </stencil-route>

          <stencil-route
            url="/developers"
          >
            {this.renderHeaderNav('developers')}
          </stencil-route>
        </stencil-route-switch>
        <select name="locale" onChange={this.onChangeLocale}>
          <option value="en" selected={l10n.getLocale() === 'en'}>
            English
          </option>
          <option value="ru" selected={l10n.getLocale() === 'ru'}>
            Русский
          </option>
        </select>
      </header>
    );
  }
}
