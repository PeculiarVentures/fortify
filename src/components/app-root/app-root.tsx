import { Component, h, Host } from '@stencil/core';
import { l10n }  from '../../utils/l10n';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss'
})
export class AppRoot {
  render() {
    return (
      <Host>
        <app-header />
        <stencil-router>
          <stencil-route-switch scrollTopOffset={0}>
            <stencil-route
              url="/"
              component="landing-user-page"
              exact={true}
            />
            <stencil-route
              url="/developers"
              component="landing-dev-page"
              exact={true}
            />
            <stencil-route
              url="/developers/docs/:page*"
              routeRender={(props) => (
                <doc-page
                  path={`/pages/docs/${l10n.getLocale()}/${props.match.params.page || 'index'}.json`}
                />
              )}
            />
            <stencil-route
              url="/developers/examples/:page*"
              routeRender={(props) => (
                <doc-page
                  path={`/pages/examples/${l10n.getLocale()}/${props.match.params.page || 'index'}.json`}
                />
              )}
            />
            <stencil-route component='notfound-page'></stencil-route>
          </stencil-route-switch>
        </stencil-router>
        <app-footer />
      </Host>
    );
  }
}
