namespace Proxies {
  // 新增正向代理
  export enum Network {
    INNER_NETWORK_BIG_DATA = 'proxy-bigdata.mppwr.com:3129',
    INNER_NETWORK_LEKIMA_64 = 'proxy-64.mppwr.com:3129'
  }

  // 新增正向代理
  export const networks = [Network.INNER_NETWORK_BIG_DATA, Network.INNER_NETWORK_LEKIMA_64]

  // @reference https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
  }

  export const getNetwork = (network?: Network) => {
    if (network) {
      return network
    }
    try {
      return networks[getRandomInt(0, networks.length)]
    } catch (e: unknown) {
      // ensure index is not out of bound
      return networks[getRandomInt(0, networks.length - 1)]
    }
  }
}

export default Proxies
