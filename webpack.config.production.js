'use strict';

var _ = require('lodash');
var webpack = require('webpack');
var baseConfig = require('./webpack.config.base');

var productionConfig = {
  output: {
    filename: 'tinytar.min.js',
    path: './dist'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  ]
};

var config = _.merge({}, baseConfig, productionConfig);

module.exports = config;
