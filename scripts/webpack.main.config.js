const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'electron-main',
  devtool: 'source-map',
  mode: 'development',
  entry: {
    main: path.join(__dirname, '../src/main/main.ts'),
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
  externals: {
    pkcs11js: 'require("pkcs11js")',
    pcsclite: 'require("pcsclite")',
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
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
};
