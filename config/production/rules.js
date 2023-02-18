const getStyleLoaders = require('../webpack/getStyleLoaders');
let rules = require('../base/rules');

const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const cssModuleRegex = /\.module\.css$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const cssLoaderRule = {
  test: cssRegex,
  exclude: cssModuleRegex,
  use: getStyleLoaders({
      importLoaders: 1,
      sourceMap: true,
      modules: {
        mode: 'icss',
      },
    },
    null,
    false,
  ),
  sideEffects: true,
}

const cssModuleLoaderRule = {
  test: cssModuleRegex,
  use: getStyleLoaders({
      importLoaders: 1,
      sourceMap: true,
      modules: {
        mode: 'local',
        getLocalIdent: (context, localIdentName, localName, options) => {
          return localIdentName.replace("-src", "").toLowerCase();
        },
      },
    },
    null,
    false,
  ),
};

const sassLoaderRule = {
  test: sassRegex,
  exclude: sassModuleRegex,
  use: getStyleLoaders(
    {
      importLoaders: 3,
      sourceMap: true,
      modules: {
        mode: 'icss',
      },
    },
    'sass-loader',
    false
  ),
  sideEffects: true,
};

const sassModuleLoaderRule = {
  test: sassModuleRegex,
  use: getStyleLoaders(
    {
      importLoaders: 3,
      sourceMap: true,
      modules: {
        mode: 'local',
        getLocalIdent: (context, localIdentName, localName, options) => {
          return localIdentName.replace("-src", "").toLowerCase();
        },
      },
    },
    'sass-loader',
    false
  ),
};
/*
rules.push(
  cssLoaderRule,
  cssModuleLoaderRule,
  sassLoaderRule,
  sassModuleLoaderRule
);
*/

rules[0].oneOf.push(
  cssLoaderRule,
  cssModuleLoaderRule,
  sassLoaderRule,
  sassModuleLoaderRule
);

rules = rules.filter(Boolean);

module.exports = rules;
