import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.scss',
  taskQueue: 'async',
  devServer: {
    openBrowser: false,
    port: 3000,
  },
  plugins: [
    sass(),
  ],
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        { src: 'pages/**/*.json' },
        { src: 'assets' },
        { src: 'manifest.json' },
        { src: 'CNAME' },
      ],
    },
  ],
};
