'use strict';

const validate = require('webpack-validator');

const path = require('path');
const webpack = require('webpack');

var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = validate({
  devtool: 'eval-source-map',
  entry: {
		app: path.resolve(__dirname, 'app/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'build/'),
    filename: '[name].bundle.js',
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    port: 80
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      include: path.resolve('app'),
      loader: 'babel',
      query: {
        presets: ["react", "es2015", "stage-0", "react-hmre"]
      }
    }, {
      test: /\.json?$/,
      loader: 'json'
    }, {
      test: /\.css$/,
      loader: "style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]",
    }] 
  },

  // Fix error about 'fs' module from webpack.
  node: {
    fs: "empty"
  },

  plugins: [
    new CopyWebpackPlugin(
      // Patterns.
      [{
        from: 'public'
      }],
      // Options
      {}
    ),
    new HtmlWebpackPlugin({
      template: 'app/index.tpl.html',
      inject: 'body',
      filename: 'index.html',
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin({
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      multiStep: true
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]
});
