const config = {

  entry: {
    common: './src/common/index.js',
    page1: './src/page1/index.js',
    page2: './src/page2/index.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/build'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader'}
        ]
      }
    ]
  }
};

module.exports = config;
