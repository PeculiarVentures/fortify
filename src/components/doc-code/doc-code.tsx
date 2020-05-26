import { Component, Host, h, Element, Prop, State } from '@stencil/core';

@Component({
  tag: 'doc-code',
  styleUrl: 'doc-code.scss',
})
export class DocCode {
  @Element() el: HTMLElement;

  @Prop({ reflectToAttr: true }) language = '';

  @State() showCopyConfirmation = false;

  copyCodeText = () => {
    this.showCopyConfirmation = true;

    const codeEl = this.el.querySelector('code');
    const codeText = codeEl.textContent || '';

    const el = document.createElement('textarea');
    el.value = codeText;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    setTimeout(() => {
      this.showCopyConfirmation = false;
    }, 2000);
  };

  render() {
    return (
      <Host>
        <div
          class={{
            'code_copy': true,
            'm_copied': this.showCopyConfirmation
          }}
        >
          <button
            class="code_copy_button"
            onClick={this.copyCodeText}
            type="button"
          >
            Copy
          </button>
          <span class="code_copy_confirmation">
            Copied
          </span>
        </div>
      </Host>
    );
  }
}
