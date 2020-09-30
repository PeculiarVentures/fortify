const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');

module.exports = merge.smart(baseConfig, {
  target: 'electron-main',
  entry: {
    main: path.join(__dirname, '../src/main/index.ts'),
  },
  externals: {
    pkcs11js: 'require("pkcs11js")',
    pcsclite: 'require("pcsclite")',
  },
});
