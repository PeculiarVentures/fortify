import { Component, h, Host } from '@stencil/core';
import { l10n } from '../../utils/l10n';
import navigationDocs from '../../pages/docs/navigation';
import navigationExamples from '../../pages/examples/navigation';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss'
})
export class AppRoot {
  render() {
    return (
      <Host>
        <app-header />
        <stencil-router scrollTopOffset={0}>
          <stencil-route-switch>
            <stencil-route
              url="/"
              exact={true}
              component="landing-users-page"
            />
            <stencil-route
              url="/developers"
              exact={true}
              component="landing-developers-page"
            />
            <stencil-route
              url="/developers/docs/:page*"
              routeRender={(props) => ([
                <doc-menu
                  key="menu"
                >
                  <doc-nav items={navigationDocs} />
                </doc-menu>,
                <doc-page
                  key="page"
                  path={`/pages/docs/${l10n.getLocale()}/${props.match.params.page || 'index'}.json`}
                />
              ])}
            />
            <stencil-route
              url="/developers/examples/:page*"
              routeRender={(props) => ([
                <doc-menu
                  key="menu"
                >
                  <doc-nav items={navigationExamples} />
                </doc-menu>,
                <doc-page
                  key="page"
                  path={`/pages/examples/${l10n.getLocale()}/${props.match.params.page || 'index'}.json`}
                />
              ])}
            />
            <stencil-route
              component='notfound-page'
            />
          </stencil-route-switch>
        </stencil-router>
        <app-footer />
      </Host>
    );
  }
}
