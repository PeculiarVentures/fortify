import { Component, h, Element, Prop, Host } from '@stencil/core';
import { toLink } from '../../utils/toLink';
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

  toItem = (item, level = 0) => {
    const [, value] = item;

    switch (typeof value) {
      case 'string':
        return (
          <li key={item}>
            {toLink(item)}
          </li>
        );
      case 'object':
        return (
          <li key={item}>
            {this.toSection(item, level + 1)}
          </li>
        );
      default:
        return null;
    }
  }

  toSection = ([id, value], level) => {
    const text = l10n.getString(id);
    const items = this.normalizeItems(value);

    return (
      <section>
        {id !== '' && text !== undefined ? (
          <header class="header">{text}</header>
        ) : null}
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
