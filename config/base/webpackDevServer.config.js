const paths = require('./paths');
const fs = require('fs');

const host = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT;
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT;

module.exports = {
  devServer: {
    /*stats: {
      children: false,
      maxModules: 0,
    },
    hot: true,
    inline: true,
    open: true,
    clientLogLevel: 'none',
    overlay: overlay,
    publicPath: '/',
    contentBase: paths.appPublic,
    watchContentBase: true,
    */
    hot: true,
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    compress: true,
    host,
    port: PORT,
    static: {
      directory: paths.appPublic,
      publicPath: [paths.publicUrlOrPath],
      watch: {
        // ignored: ignoredFiles(paths.appSrc),
      },
    },
    client: {
      reconnect: 5,
      progress: true,
      webSocketURL: {
        hostname: sockHost,
        pathname: sockPath,
        port: sockPort,
      },
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(0, -1),
    },
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
    //https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares
    setupMiddlewares: (middlewares, devServer) => {
      /*
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.get('/setup-middleware/some/path', (_, response) => {
        response.send('setup-middlewares option GET');
      });

      middlewares.push({
        name: 'hello-world-test-one',
        // `path` is optional
        path: '/foo/bar',
        middleware: (req, res) => {
          res.send('Foo Bar!');
        },
      });

      middlewares.push((req, res) => {
        res.send('Hello World!');
      });*/

      return middlewares;
    },


    /*
    onBeforeSetupMiddleware(devServer) {
       if (fs.existsSync(paths.proxySetup)) {
        // This registers user provided middleware for proxy reasons
      require(paths.proxySetup)(devServer.app);
      }
    },
    onAfterSetupMiddleware(devServer) {},
      before(app, server) {
        if (fs.existsSync(paths.proxySetup)) {
         require(paths.proxySetup)(app);
       }
    },*/
  },
};
