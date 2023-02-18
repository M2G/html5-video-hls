const paths = require('./paths');

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

const tsLoader = {
  test: /\.(ts)$/,
  include: paths.appSrc,
  loader: require.resolve('ts-loader'),
  options: {
    transpileOnly: true
  },
};

const svgLoaderRule = {
  test: /\.svg$/,
  use: [
    {
      loader: require.resolve('@svgr/webpack'),
      options: {
        prettier: false,
        svgo: false,
        svgoConfig: {
          plugins: [{ removeViewBox: false }],
        },
        titleProp: true,
        ref: true,
      },
    },
    {
      loader: require.resolve('file-loader'),
      options: {
        name: 'static/media/[name].[hash].[ext]',
      },
    },
  ],
  issuer: {
    and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
  },
}

const imgLoaderRule = {
  test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: imageInlineSizeLimit,
    },
  },
}

const filesLoaderRule = {
  test: /.(png|svg|jpe?g|gif|ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
  loader: require.resolve('file-loader'),
  options: {
    name(file) {
      if (process.env.NODE_ENV === 'development') {
        return '[path][name].[ext]';
      }

      return '[contenthash].[ext]';
    },
  },
};

const webpacksInternalLoaders = {
  exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
  type: 'asset/resource',
}

const rules = [{
  oneOf: [
    imgLoaderRule,
    svgLoaderRule,
    tsLoader,
    filesLoaderRule,
    // webpacksInternalLoaders,
  ]
}].filter(Boolean);

module.exports = rules;
