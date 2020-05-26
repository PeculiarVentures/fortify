import { Component, h, Host } from '@stencil/core';
import { l10n } from '../../utils/l10n';
import pagesDocs from '../../pages/docs';
import pagesExamples from '../../pages/examples';

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
              exact={true}
              routeRender={() => ([
                <landing-user-page key="landing" />,
                <app-footer key="footer" />,
              ])}
            />
            <stencil-route
              url="/developers"
              exact={true}
              routeRender={() => ([
                <landing-user-page key="landing" />,
                <app-footer key="footer" />,
              ])}
            />
            <stencil-route
              url="/developers/docs/:page*"
              routeRender={(props) => ([
                <doc-menu
                  key="menu"
                >
                  <doc-nav items={pagesDocs} />
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
                  <doc-nav items={pagesExamples} />
                </doc-menu>,
                <doc-page
                  key="page"
                  path={`/pages/examples/${l10n.getLocale()}/${props.match.params.page || 'index'}.json`}
                />
              ])}
            />
            <stencil-route component='notfound-page' />
          </stencil-route-switch>
        </stencil-router>
      </Host>
    );
  }
}
