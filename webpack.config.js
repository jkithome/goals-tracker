var path = require('path');
var  Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    bundle: './src/app.js',
    config: './config.js'
  },
  output : {
    path: path.join(__dirname, 'dist'),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react']
          }
        }]
      }
    ]
  },
  plugins: [
    new Dotenv({
      path: './.env',
    })
  ]
}