const path = require('path');
const paths = require('./paths');

const output = {
  path: paths.appBuild,
  publicPath: '/',
  devtoolModuleFilenameTemplate:
    (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'))
};

module.exports = output;
