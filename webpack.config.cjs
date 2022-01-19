/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const TerserPlugin = require('terser-webpack-plugin')
const { merge } = require('webpack-merge')
const util = require('util')

const developmentConfig = require('./webpack.config.development')
const productionConfig = require('./webpack.config.production')

const commonConfig = {
  target: 'node',
  externals: [nodeExternals()],
  externalsType: 'import',
  devtool: 'inline-source-map',
  mode: 'none',
  entry: {
    app: './src/index.ts'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      http: require.resolve('http')
    },
    alias: {
      '@': path.resolve(__dirname, './'),
      '~': path.resolve(__dirname, './')
    }
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  }
}

const mergeFn = (env) => {
  console.log('webpack_env', util.inspect(env, { depth: null }))
  if (env.config === 'dev') {
    return merge(commonConfig, developmentConfig)
  }
  return merge(commonConfig, productionConfig)
}

module.exports = mergeFn
