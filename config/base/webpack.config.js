const path = require('path');
const paths = require('./paths');
const entry = require('./entry');
const plugins = require('./plugins');
const cache = require('./cache');
const output = require('./output');
const modules = require('../webpack/module/module');
const { settings } = require('../../package.json');

const obj = {};

const alias = settings?.alias?.map;

for (let i = 0; i < alias.length; i += 1) {
  obj[alias[i][0]] = path.join(process.cwd(), alias[i][1]);
}

console.log('obj', obj)

module.exports = {
  target: ['browserslist'],
  entry,
  output,
  plugins,
  cache,
  infrastructureLogging: {
    level: 'none',
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(modules.additionalModulePaths || []),
    extensions: ['*', '.js', '.json', '.ts', '.scss'],
    alias: {
      // "@Icon": path.join(process.cwd(), 'src', 'Icon')
      ...obj,
      ...(modules.webpackAliases || {}),
    },
  },
  performance: false
};
