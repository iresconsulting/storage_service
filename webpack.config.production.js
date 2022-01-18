/* eslint @typescript-eslint/no-var-requires: "off" */
const DotenvWebpackPlugin = require('dotenv-webpack')

const productionConfig = {
  plugins: [
    new DotenvWebpackPlugin({
      path: '',
      safe: false,
      systemvars: true,
    })
  ]
}

module.exports = productionConfig
