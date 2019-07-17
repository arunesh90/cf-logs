const webpack = require('webpack')

module.exports = {
  entry  : './src/main.ts',
  mode   : 'development',
  devtool: 'inline-source-map',
  module : {
    rules: [
      {
        test   : /\.tsx?$/,
        use    : 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.LOG_BASE_URL': `'${process.env.LOG_BASE_URL}'`,
      'process.env.AUTH_KEY'    : `'${process.env.AUTH_KEY}'`
    })
  ],
  resolve: {
    extensions: ['.ts', '.js' ]
  },
  output: {
    path      : __dirname + '/dist',
    publicPath: 'dist',
    filename  : 'worker.js'
  }
}
