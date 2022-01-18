/* eslint @typescript-eslint/no-var-requires: "off" */
const DotenvWebpackPlugin = require('dotenv-webpack')

const developmentConfig = {
  plugins: [
    new DotenvWebpackPlugin({
      path: './.env.dev',
      safe: false,
      systemvars: true,
    })
  ]
}

module.exports = developmentConfig
