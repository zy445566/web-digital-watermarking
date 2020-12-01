const path = require('path');

module.exports = {
  mode:'development',
  entry: path.join(__dirname, 'test','test.js'),
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'webpack.bundle.js'
  },
  devServer:{
    contentBase: path.resolve(__dirname, 'static'),
    open:true,
    port:8080
  }
};