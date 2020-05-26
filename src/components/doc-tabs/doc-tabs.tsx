import { Component, h, State, Element } from '@stencil/core';

@Component({
  tag: 'doc-tabs',
  styleUrl: 'doc-tabs.scss',
})
export class DocTabs {
  @State() selected: HTMLDocTabElement = null;

  @State() tabs: HTMLDocTabElement[] = [];

  @Element() element: HTMLDocTabElement;

  componentDidLoad() {
    this.tabs = Array.from(this.element.querySelectorAll('doc-tab'));
    this.select(this.tabs.find(t => t.hasAttribute('selected')) || this.tabs[0]);
  }

  select(tab: HTMLDocTabElement) {
    if (tab != null) {
      if (this.selected != null) {
        this.selected.removeAttribute('selected');
      }

      this.selected = tab;
      this.selected.setAttribute('selected', '');
    }
  }

  toTabButton = (tab: HTMLDocTabElement) => {
    const label = tab.getAttribute('tab');
    const isSelected = this.selected === tab;
    const buttonClass = {
      'button': true,
      'm_selected': isSelected
    };

    return (
      <button
        role="tab"
        aria-selected={isSelected ? 'true' : 'false'}
        onClick={() => this.select(tab)}
        class={buttonClass}
      >
        {label}
      </button>
    );
  }

  hostData() {
    return {
      role: 'tablist',
    };
  }

  render() {
    return [
      <header class="header">
        {this.tabs.map(this.toTabButton)}
      </header>,
      <slot/>
    ];
  }
}
