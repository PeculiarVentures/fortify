import { Component, Host, h, Prop } from '@stencil/core';
import { toHypertext } from './toHypertext';

@Component({
  tag: 'md-viewer',
  styleUrl: 'md-viewer.scss',
})
export class MdViewer {
  @Prop() path?: string;

  @Prop() showTitle?: boolean;

  @Prop() notFound?: HTMLElement;

  content?: IMarkdownContent;

  async componentWillRender() {
    if (this.path) {
      try {
        this.content = await fetchContent(this.path);
      } catch (error) {
        console.log(error);
      }
    }
  }

  render() {
    if (!this.content) {
      return this.notFound || null;
    }

    return (
      <Host>
        {this.content.title && this.showTitle && ([
          <stencil-route-title
            pageTitle={this.content.title}
          />,
          <h2>
            {this.content.title}
          </h2>
        ])}
        {toHypertext(h, this.content.body)}
      </Host>
    );
  }
}

const localCache = new Map<string, Promise<IMarkdownContent>>();

const fetchContent = async (path: string) => {
  let promise = localCache.get(path);

  if (!promise) {
    console.log('fetchContent', path);
    const response = await fetch(path);

    if (!response.ok) {
      throw response;
    };

    promise = response.json();
    localCache.set(path, promise);
  }

  return promise;
}
