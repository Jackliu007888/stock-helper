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
          loader: 'babel-loader'
      }, {
          test: /\.vue$/,
          loader: 'vue-loader'
      },
      {
        test: /\\.css$/,
        loader: 'style!css'
    },
    {
        test: /\\.(eot|woff|woff2|ttf)([\\?]?.*)$/,
        loader: 'file'
    }]
  }
}