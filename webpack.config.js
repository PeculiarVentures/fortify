const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: path.join(__dirname, './src/main/main.ts'),
    // windows
    keys: path.join(__dirname, './src/renderer/forms/keys/index.tsx'),
    about: path.join(__dirname, './src/renderer/forms/about/index.tsx'),
    'key-pin': path.join(__dirname, './src/renderer/forms/key-pin/index.tsx'),
    'p11-pin': path.join(__dirname, './src/renderer/forms/p11-pin/index.tsx'),
    message: path.join(__dirname, './src/renderer/forms/message/index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js',
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
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
    'react': 'React',
    'react-dom': 'ReactDOM',
    'asn1js': 'require("asn1js")',
    'child_process': 'require("child_process")',
    'electron': 'require("electron")',
    'fs': 'require("fs")',
    'jose-jwe-jws': 'require("jose-jwe-jws")',
    'node-webcrypto-ossl': 'require("node-webcrypto-ossl")',
    'os': 'require("os")',
    'crypto': 'require("crypto")',
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
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
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
