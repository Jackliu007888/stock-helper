module.exports = {
  context: __dirname + '/app/scripts.babel/',
  entry: {
      background: './background.js', // remove unused
      chromereload: './chromereload.js',
      // contentscript: './contentscript.js',
      popup: './popup.js',
  },
  output: { filename: '[name].js' },
  module: {
      rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
      }, {
          test: /\.vue$/,
          loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
    },
    {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'url-loader'
    }]
  }
}