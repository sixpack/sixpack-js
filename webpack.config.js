const path = require('path');

const serverConfig = {
  entry: './src/sixpack-server.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sixpack-server.js',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
};

const browserConfig = {
  entry: './src/sixpack-browser.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sixpack-browser.js',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /sixpack-browser.js/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
};

module.exports = [serverConfig, browserConfig];
