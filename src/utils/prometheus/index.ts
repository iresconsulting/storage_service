import client, { Gauge, Registry } from 'prom-client'

namespace Prometheus {
  export enum StatusCode {
    SUCCESS = 1,
    FAILURE = 0
  }

  export enum Metrics {
    crypto_price_status = 'crypto_price_status'
  }

  export let registry: null | Registry = null

  function _createCryptoPriceStatusMetrics(registry: Registry) {
    const _gauge = new client.Gauge({
      name: Metrics.crypto_price_status,
      help: `${Metrics.crypto_price_status}_help`,
      labelNames: ['exchange']
    })
    registry.registerMetric(_gauge)
    _metrics[Metrics.crypto_price_status] = _gauge
  }

  export function factory() {
    registry = new client.Registry()
    registry.setDefaultLabels({
      app: 'node_crypto_crawler'
    })

    _createCryptoPriceStatusMetrics(registry)
  }

  const _metrics: Record<string, Gauge<string>> = {}

  export function setMetrics(statusCode: StatusCode, options?: { targetMetric?: Metrics, data?: any }) {
    if (options) {
      const { targetMetric, data } = options
      if (targetMetric) {
        _metrics[targetMetric].set({ exchange: data }, statusCode)
      }
    } else {
      throw new Error('attempt to set unknown targetMetric')
    }
  }
}

export default Prometheus
