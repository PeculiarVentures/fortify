var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    keys: [
      path.join(
        __dirname,
        './src/renderer/keys/index.jsx'
      ),
    ],
    main: path.join(__dirname, './src/main/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js',
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   beautify: false,
    //   comments: false,
    //   sourceMap: true,
    //   compress: {
    //     sequences: true,
    //     booleans: true,
    //     loops: true,
    //     unused: true,
    //     warnings: false,
    //     drop_console: true,
    //     unsafe: true,
    //   },
    // }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      children: false,
      async: true,
    }),
  ],
  node: {
    __dirname: false,
  },
  externals: {
    'asn1js': 'require("asn1js")',
    'child_process': 'require("child_process")',
    'electron': 'require("electron")',
    'fs': 'require("fs")',
    'jose-jwe-jws': 'require("jose-jwe-jws")',
    'node-webcrypto-ossl': 'require("node-webcrypto-ossl")',
    'os': 'require("os")',
    'path': 'require("path")',
    'pkijs': 'require("pkijs")',
    'request': 'require("request")',
    'semver': 'require("semver")',
    'sudo-prompt': 'require("sudo-prompt")',
    'url': 'require("url")',
    'webcrypto-local': 'require("webcrypto-local")',
    'winston': 'require("winston")',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[local]_[hash:base64:5]',
          'sass-loader',
        ],
      },
    ],
  },
};
