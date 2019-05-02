const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const loaders = require('./loaders.js');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'node',
  externals: [nodeExternals()],
  entry: {
    test: path.resolve(__dirname, '../test/tests.js'),
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Webpack Test'
    }),
    require('autoprefixer')
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '..')
  },
  module: {
    rules: [
      loaders.JSLoader,
      loaders.ESLintLoader,
      {
        test: /\.(css|scss)(\?.*$|$)/,
        loader: 'null-loader'
      }
    ]
  }
};
