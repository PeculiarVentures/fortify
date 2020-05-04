const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'electron-renderer',
  devtool: 'source-map',
  mode: 'development',
  entry: {
    about: path.join(__dirname, '../src/renderer/containers/about/index.tsx'),
    message: path.join(__dirname, '../src/renderer/containers/message/index.tsx'),
    'key-pin': path.join(__dirname, '../src/renderer/containers/key_pin/index.tsx'),
    'p11-pin': path.join(__dirname, '../src/renderer/containers/p11_pin/index.tsx'),
    settings: path.join(__dirname, '../src/renderer/containers/settings/index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, '../out'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  node: {
    __dirname: false,
    __filename: false,
    Buffer: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
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
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
};
