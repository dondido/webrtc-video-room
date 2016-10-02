// webpack should be in the node_modules directory, install if not.
// https://medium.com/@tkssharma/eslint-in-react-babel-webpack-9cb1c4e86f4e#.hlophrwed
var webpack = require("webpack");
module.exports = {
  devtool: 'eval',
  entry: './src/index.js',
  output: {
    path: './public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel-loader', 'eslint-loader']
      }
    ]
  },
  plugins:[
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],
  resolve: {
    extensions: ['', '.js', '.json']
  }
};
