const JSLoader = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env']
    }
  }
};

const ESLintLoader = {
  test: /\.js$/,
  enforce: 'pre',
  exclude: /node_modules/,
  use: {
    loader: 'eslint-loader',
    options: {
      configFile: __dirname + '/.eslintrc'
    },
  }
};

const CSSLoader = {
  test: /\.(css|scss)$/,
  use: [
    {
      loader: 'raw-loader'
    },
    {
      loader: 'postcss-loader',
      options: {
        config: {
          path: __dirname + '/postcss.config.js'
        }
      }
    },
    {
      loader: 'sass-loader'
    }
  ],
};

const FileLoader = {
  test: /\.(png|svg|jpg|gif)$/,
  use: [
    'file-loader'
  ]
};

module.exports = {
  JSLoader: JSLoader,
  ESLintLoader: ESLintLoader,
  CSSLoader,
  FileLoader
};