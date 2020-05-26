import {
  PAGES_DIR,
  Page,
  buildPages,
} from '../index';

import fs from 'fs-extra';
import glob from 'fast-glob';
import frontMatter from 'front-matter';
import markdownRenderer from '../markdown-renderer';

export default {
  title: 'Build static pages',
  task: (_, status) => buildPages(getStaticPages, status)
};

async function getStaticPages(): Promise<Page[]> {
  const paths = await getMarkdownPaths(PAGES_DIR);
  return Promise.all(paths.map(path => toPage(path)));
}

export const getMarkdownPaths = (cwd: string): Promise<string[]> =>
  glob('**/*.md', {
    absolute: true,
    cwd
  });

export interface ToStaticPageOptions {
  prod?: boolean;
}

export const toPage = async (path: string) => {
  return {
    path: path.replace(PAGES_DIR, '/docs').replace(/\.md$/i, ''),
    github: null,
    ...renderMarkdown(await readMarkdown(path))
  };
};

const renderMarkdown = (markdown: string) => {
  const { body, attributes } = frontMatter(markdown);
  return {
    ...attributes as any,
    body: markdownRenderer(body)
  };
};

const readMarkdown = (path: string): Promise<string> =>
  fs.readFile(path, {
    encoding: 'utf8'
  });
