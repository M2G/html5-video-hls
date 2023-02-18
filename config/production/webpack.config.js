const TerserPlugin            = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const baseConfig              = require('../base/webpack.config');
const output                  = require('./output');
const plugins                 = require('./plugins');
const rules                   = require('./rules');

module.exports = Object.assign({}, baseConfig, {
  mode: 'staging',
  bail: true,
  devtool: 'source-map',
  output,
  module: {
    rules
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          // Added for profiling in devtools
          keep_classnames: true,
          keep_fnames: true,
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        sourceMap: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins
});
