interface IMarkdownContent {
  title: string;
  path: string;
  pageClass: string;
  headings: { href: string; text: string }[];
  github?: string;
  body: any[];
}
