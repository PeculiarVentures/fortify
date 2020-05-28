import { isExternalLink } from '../../../src/utils';

export default function(href: string, title: string, text: string) {
  if (isExternalLink(href)) {
    return `
      <a
        href=${href}
        target="_blank"
        rel="noopener noreferrer"
        ${title ? `title=${title}` : ''}
      >
        ${text}
      </a>
    `;
  }

  return `
    <stencil-route-link
      url=${href}
      ${title ? `anchorTitle=${title}` : ''}
    >
      ${text}
    </stencil-route-link>
  `;
}
