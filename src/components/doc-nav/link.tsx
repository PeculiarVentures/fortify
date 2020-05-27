import { h } from '@stencil/core';
import { l10n } from '../../utils/l10n';
import { isExternalLink } from '../../utils';

export const toLink = (item) => {
  const [id, href] = item;
  const text = l10n.getString(id) || id;
  const isExternal = isExternalLink(href);

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        class="link"
      >
        <span>
          {text}
        </span>
      </a>
    );
  }

  return (
    <stencil-route-link
      url={href}
      strict={false}
      exact
      activeClass="m_active"
      anchorClass="link"
    >
      <span>
        {text}
      </span>
    </stencil-route-link>
  );
};
