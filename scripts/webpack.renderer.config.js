const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');

module.exports = merge.smart(baseConfig, {
  target: 'electron-renderer',
  entry: {
    about: path.join(__dirname, '../src/renderer/containers/about/index.tsx'),
    message: path.join(__dirname, '../src/renderer/containers/message/index.tsx'),
    'key-pin': path.join(__dirname, '../src/renderer/containers/key_pin/index.tsx'),
    'p11-pin': path.join(__dirname, '../src/renderer/containers/p11_pin/index.tsx'),
    settings: path.join(__dirname, '../src/renderer/containers/settings/index.tsx'),
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: '[local]_[hash:base64:5]',
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
});
