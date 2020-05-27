import { Component, h } from '@stencil/core';
import { toLink } from '../doc-nav/link';
import navigationMain from  '../../pages/navigationMain';

@Component({
  tag: 'app-header',
  styleUrl: 'app-header.scss',
})
export class AppHeader {
  private normalizeItems(items) {
    return Array.isArray(items) ? items : Object.entries(items);
  }

  render() {
    const users = [
      this.normalizeItems(navigationMain.users.main),
      this.normalizeItems(navigationMain.users.extra),
    ];
    const developers = [
      this.normalizeItems(navigationMain.developers.main),
      this.normalizeItems(navigationMain.developers.extra),
    ];

    return (
      <header>
        <stencil-route-switch>
          <stencil-route
            url="/"
            exact={true}
          >
            <stencil-route-link
              url="/"
              exact={true}
            >
              <img
                src="/assets/images/logo.svg"
                alt="Fortify logo"
                class="logo"
              />
            </stencil-route-link>
            <ul class="nav_main">
              {users[0].map(item => (
                <li key={item}>
                  {toLink(item)}
                </li>
              ))}
            </ul>
            <ul class="nav_extra">
              {users[1].map(item => (
                <li key={item}>
                  {toLink(item)}
                </li>
              ))}
            </ul>
          </stencil-route>

          <stencil-route
            url="/developers"
          >
            <stencil-route-link
              url="/developers"
              exact={true}
            >
              <img
                src="/assets/images/logo.svg"
                alt="Fortify logo"
                class="logo"
              />
            </stencil-route-link>
            <ul class="nav_main">
              {developers[0].map(item => (
                <li key={item}>
                  {toLink(item)}
                </li>
              ))}
            </ul>
            <ul class="nav_extra">
              {developers[1].map(item => (
                <li key={item}>
                  {toLink(item)}
                </li>
              ))}
            </ul>
          </stencil-route>
        </stencil-route-switch>
        <select name="locale">
          <option value="en">
            English
          </option>
          <option value="ru">
            Русский
          </option>
        </select>
      </header>
    );
  }
}
