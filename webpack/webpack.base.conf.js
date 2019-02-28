const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ExtractTextPluginLight = new ExtractTextPlugin('./css/grafana-zabbix.light.css');
const ExtractTextPluginDark = new ExtractTextPlugin('./css/grafana-zabbix.dark.css');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const http = path.resolve(__dirname, 'node_modules/stream-http/index.js');

module.exports = {
  target: 'node',
  context: resolve('src'),
  entry: {
    './module': './module.js',
    'components/config': './components/config.js',
    'panels/graph/module': './panels/graph/module.ts',
    'panels/bayesian-graph/module': './panels/bayesian-graph/module.js',
    'panels/net-status-panel/module': './panels/net-status-panel/module.js',
    'datasource/module': './datasource/module.js',
  },
  output: {
    filename: "[name].js",
    path: resolve('dist'),
    libraryTarget: "amd"
  },
  externals: [
    // remove the line below if you don't want to use builtin versions
    'jquery', 'lodash', 'moment', 'angular',
    'react', 'react-dom',
    function (context, request, callback) {
      var prefix = 'grafana/';
      if (request.indexOf(prefix) === 0) {
        return callback(null, request.substr(prefix.length));
      }
      callback();
    }
  ],
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CopyWebpackPlugin([
      { from: '**/plugin.json' },
      { from: '**/*.html' },
      { from: 'dashboards/*' },
      { from: '../README.md' },
      { from: '**/img/*' },
      { from: '**/networks/*' },
    ]),
    new CleanWebpackPlugin(['dist'], {
      root: resolve('.')
    }),
    ExtractTextPluginLight,
    ExtractTextPluginDark,
  ],
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".html", ".scss"],
    alias: { http, https: http }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(external)/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['babel-preset-env']
          }
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules|external/,
        loaders: [
          "ts-loader"
        ],
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader'
        }
      },
      {
        test: /\.light\.scss$/,
        use: ExtractTextPluginLight.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.dark\.scss$/,
        use: ExtractTextPluginDark.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
    ]
  }
};
