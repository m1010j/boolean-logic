var path = require('path');

module.exports = {
  entry: './lib/sentence.js',
  output: {
    filename: './index.js',
  },
  module: {
    loaders: [
      {
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['env'],
        },
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '*'],
  },
};
