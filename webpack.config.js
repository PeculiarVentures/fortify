var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    keys: [
      path.join(
        __dirname,
        './src/renderer/keys/index.jsx'
      )
    ]
  },
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      sourceMap: true,
      compress: {
        sequences: true,
        booleans: true,
        loops: true,
        unused: true,
        warnings: false,
        drop_console: true,
        unsafe: true
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      children: false,
      async: true
    })
  ],
  externals: {
    'electron': 'require("electron")',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.sass$/,
        use: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[local]_[hash:base64:5]',
          'sass-loader'
        ]
      },
    ]
  }
};
