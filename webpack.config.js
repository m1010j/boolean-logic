const path = require('path');

module.exports = {
  entry: './boolean-logic.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'experimental'),
  },
  module: {
    rules: [
      {
        test: [/\.js?$/],
        use: { loader: 'babel-loader' },
      },
    ],
  },
  devtool: 'source-map',
  mode: 'development',
  resolve: {
    extensions: ['.js', '*'],
  },
};
