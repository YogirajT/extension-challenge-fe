/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');

module.exports = {
  entry: [
    path.join(srcDir, 'main.ts'),
    path.join(srcDir, '/assets/sass/common.scss'),

  ],
  output: {
    publicPath: '',
    path: path.join(__dirname, '../dist/js'),
    filename: '[name].js',
  },
  optimization: {
    runtimeChunk: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: '../css/', name: '[name].css' },
          },
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '../' },
        { from: 'icons/*', to: '../images', context: 'src/assets/images/' },
      ],
      options: {},
    }),
  ],
};
