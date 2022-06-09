import axios, { AxiosRequestConfig, AxiosInstance, Method } from 'axios'
import url from 'url'

const env = process.env

enum Instance {
  localhost = 'localhost',
  // add instances here
}

interface RequestConfig {
  instance: Instance
  endpoint: string
  method?: Method
  // @ts-ignore
  query?: string | Dict<string | readonly string[]> | Iterable<[string, string]> | readonly [string, string][] | URLSearchParams | undefined
  params?: Record<string, (substring: string, ...args: any[]) => string>
  body?: Record<string, any> | any[]
}

const masterConfig: AxiosRequestConfig = {
  baseURL: env.BET_URL || '',
  timeout: 15000
}

// export const gameApi = axios.create({
//   baseURL: `${process.env.GAME_URL || 'http://localhost:6002'}`
// })

export const localhost = axios.create({
  baseURL: `${process.env.LOCALHOST_URL || 'http://localhost:8081'}`
})

export async function request({ instance, endpoint, method = 'get', query = {}, params = {}, body = {} }: RequestConfig) {
  try {
    let result: any
    const _query = new url.URLSearchParams(query)
    const _queryToStr = _query.toString()
    let _endpoint = endpoint

    Object.keys(params).map((key) => {
      _endpoint = _endpoint.replace(`:${key}`, params[key])
    })

    const requestObj = {
      url: _queryToStr ? `${_endpoint}?${_queryToStr}` : _endpoint,
      method,
      data: { ...body },
      query
    }

    if (method !== 'get') {
      requestObj.data = { ...body }
    }

    // add instances here
    switch (instance) {
      case Instance.localhost:
        result = await localhost.request(requestObj)
      default:
        break
    }

    const { data } = result

    return data
  } catch (e) {
    throw new Error(`[axios] error: ${method.toUpperCase()} ${endpoint}`)
  }
}

export function responseParser({ statusCode, statusMsg, data }: any) {
  if (statusCode === 200) {
    return data
  }
  throw new Error(`[api] error: ${statusCode} ${statusMsg}`)
}

export const apiMaster: AxiosInstance = axios.create({
  ...masterConfig
})
