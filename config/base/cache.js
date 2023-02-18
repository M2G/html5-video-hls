const fs = require('fs');
const paths = require('./paths');
const createEnvironmentHash = require('../webpack/persistenceCache/createEnvHash');
const getClientEnvironment = require('./env');
const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

const cache = {
  type: 'filesystem',
  version: createEnvironmentHash(env.raw),
  cacheDirectory: paths.appWebpackCache,
  store: 'pack',
  buildDependencies: {
    defaultWebpack: ['webpack/lib/'],
    config: [__filename],
    tsconfig: [paths.appTsConfig, paths.appJsConfig].filter(f =>
      fs.existsSync(f)
    ),
  },
}

  module.exports = cache;
