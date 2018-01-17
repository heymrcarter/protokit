const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const path = require('path')
const pkg = require('./package.json')

const utils = {
  assetsPath: (_path) => {
    const assetsSubDirectory = 'static'
    return path.posix.join(assetsSubDirectory, _path)
  },
  createNotifierCallback: () => {
    const notifier = require('node-notifier')

    return (severity, errors) => {
      if (severity !== 'error') {
        return
      }
      const error = errors[0]

      console.error(error)

      const filename = error.file.split('!').pop()
      notifier.notify({
        title: pkg.name,
        message: severity + ': ' + error.name,
        subtitle: filename || '',
        icon: path.join(__dirname, 'logo.png')
      })
    }
  }
}

const config =  {
  entry: ['./main.js'],
  context: path.resolve(__dirname, './src'),
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    inline: true,
    contentBase: './src',
    watchContentBase: true,
    host: 'localhost',
    port: 8000,
    open: true,
    overlay: {
      warnings: false,
      errors: true,
    },
    publicPath: '/',
    proxy: {},
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: false,
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new HtmlWebpackHarddiskPlugin({
      alwaysWriteToDisk: true,
      outputPath: path.resolve(__dirname, 'src')
    })
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader', options: {
            sourceMap: true
          }},
          {loader: 'sass-loader', options: {
            sourceMap: true
          }},
          {loader: 'resolve-url-loader'}
        ]
      }
    ]
  }
}

module.exports = new Promise((resolve, reject) => {
  config.plugins.push(new FriendlyErrorsPlugin({
    compilationSuccessInfo: {
      messages: [`Your application is running here: http://localhost:8000`],
    },
    onErrors: utils.createNotifierCallback()
  }))

  resolve(config)
})
