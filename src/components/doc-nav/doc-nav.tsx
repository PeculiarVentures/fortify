import { Component, h, Element, Prop, Host } from '@stencil/core';
import { link } from './link';
import { l10n } from '../../utils/l10n';

@Component({
  tag: 'doc-nav',
  styleUrl: 'doc-nav.scss',
})
export class DocNav {
  @Element() element: HTMLElement;

  @Prop() items: IMenuItems;

  private normalizeItems(items) {
    return Array.isArray(items) ? items : Object.entries(items);
  }

  toLink = link;

  toItem = (item, level = 0) => {
    const [id, value] = item;
    switch (typeof value) {
      case 'string':
        // Go ahead...git blame...I know you want TWO :-)
        if (id.match(/menu-native-[ce]e-show-all/)) {
         return <li style={{ 'font-style': 'italic' }} key={item}>{this.toLink(item)}</li>;
        }
        return <li key={item}>{this.toLink(item)}</li>;
      case 'object':
        return <li key={item}>{this.toSection(item, level + 1)}</li>;
      default:
        return null;
    }
  }

  toSection = ([id, value], level) => {
    const text = l10n.getString(id);
    const items = this.normalizeItems(value);

    return (
      <section>
        { id !== '' && text !== undefined ? <header class="header">{text}</header> : null }
        <ul
          class="subnav"
          style={{ '--level': level }}
        >
          {items.map(item => this.toItem(item, level))}
        </ul>
      </section>
    );
  }

  setScroll = () => {
    this.element.offsetParent ?
      this.element.offsetParent.scrollIntoView() :
      this.element.scrollIntoView();
  }

  componentDidLoad() {
    requestAnimationFrame(this.setScroll);
  }

  render() {
    return (
      <Host role="navigation">
        <ul class="nav">
          {this.normalizeItems(this.items).map(item => this.toItem(item))}
        </ul>
      </Host>
    );
  }
}
