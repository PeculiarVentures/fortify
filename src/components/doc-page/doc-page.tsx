import { Component, Host, h, Prop, ComponentInterface } from '@stencil/core';
import { toHypertext } from './toHypertext';

@Component({
  tag: 'doc-page',
  styleUrl: 'doc-page.scss',
})
export class DocPage implements ComponentInterface {
  @Prop() path?: string;

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
      return (
        <div>
          <h1>Not Found</h1>
          <p>Sorry, we couldn't find that page.</p>
        </div>
      );
    }

    return (
      <Host>
        <stencil-route-title
          pageTitle={this.content.title}
        />
        <div class="content">
          {this.content.title && (
            <h2>
              {this.content.title}
            </h2>
          )}
          {toHypertext(h, this.content.body)}
        </div>
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
      throw response
    };

    promise = response.json();
    localCache.set(path, promise);
  }

  return promise;
}

