export const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\w]+/g, '-');

export const isExternalLink = (href: string) =>
  href.indexOf('http') === 0 || href.indexOf('mailto:') === 0;
