const path = require('path');
const paths = require('../base/paths');
const output = require('../base/output');


output.path = paths.appBuild;
output.filename = 'static/js/[name].[contenthash:8].js';
output.chunkFilename = 'static/js/[name].[contenthash:8].chunk.js';
output.devtoolModuleFilenameTemplate = info => path
  .relative(paths.appSrc, info.absoluteResourcePath)
  .replace(/\\/g, '/');

module.exports = output;
