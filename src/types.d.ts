interface IMarkdownContent {
  title: string;
  path: string;
  pageClass: string;
  headings: { href: string; text: string }[];
  github?: string;
  body: any[];
}

type IMenuItem = [string, string];

interface IMenuItems {
  [key: string]: string | IMenuItems | IMenuItem[];
}
