const webpack = require('webpack')

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ]
  },
  // devServer: {
  //   proxy: "http://sandbox_api.estudy.chanke.xyz/"
  // }
}