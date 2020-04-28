const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const { development } = argv;

  return {
    mode: development ? 'development' : 'none',
    entry: {
      main: path.join(__dirname, '../src/main/main.ts'),
      // windows
      about: path.join(__dirname, '../src/renderer/containers/about/index.tsx'),

      keys: path.join(__dirname, '../src/renderer/forms/keys/index.tsx'),
      'key-pin': path.join(__dirname, '../src/renderer/forms/key-pin/index.tsx'),
      'p11-pin': path.join(__dirname, '../src/renderer/forms/p11-pin/index.tsx'),
      message: path.join(__dirname, '../src/renderer/forms/message/index.tsx'),
    },
    output: {
      path: path.resolve(__dirname, '../out'),
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
          NODE_ENV: JSON.stringify(development ? 'development' : 'production'),
        },
      }),
    ],
    node: {
      __dirname: false,
      Buffer: false,
    },
    externals: {
      '2key-ratchet': 'require("2key-ratchet")',
      '@webcrypto-local/server': 'require("@webcrypto-local/server")',
      react: 'require("react")',
      'react-dom': 'require("react-dom")',
      'lib-react-components': 'require("lib-react-components")',
      asn1js: 'require("asn1js")',
      child_process: 'require("child_process")',
      electron: 'require("electron")',
      fs: 'require("fs")',
      'jose-jwe-jws': 'require("jose-jwe-jws")',
      '@peculiar/webcrypto': 'require("@peculiar/webcrypto")',
      pkcs11js: 'require("pkcs11js")',
      pcsclite: 'require("pcsclite")',
      buffertools: 'require("buffertools")',
      os: 'require("os")',
      crypto: 'require("crypto")',
      path: 'require("path")',
      pkijs: 'require("pkijs")',
      request: 'require("request")',
      semver: 'require("semver")',
      'sudo-prompt': 'require("sudo-prompt")',
      url: 'require("url")',
      winston: 'require("winston")',
    },
    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be
        // handled by 'awesome-typescript-loader'.
        {
          test: /\.tsx?$/,
          loader: 'awesome-typescript-loader',
        },
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
        },
        // All files with a '.sass' extension will be
        // handled by 'sass-loader&css-loader&style-loader'.
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
  };
};
