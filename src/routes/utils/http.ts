import { NextFunction, Request, Response } from 'express'
import { Device } from './device'

export namespace HttpRes {
  function _getSerializedString(message: unknown) {
    return (message as string).toString()
  }

  export function send500(res: Response, message?: unknown, data?: any) {
    return res.send({ code: 500, msg: _getSerializedString(message || 'internal server error'), data })
  }

  export function send403(res: Response, message?: unknown, data?: any) {
    return res.send({ code: 403, msg: _getSerializedString(message || 'denied access'), data })
  }

  export function send401(res: Response, message?: unknown, data?: any) {
    return res.send({ code: 401, msg: _getSerializedString(message || 'unauthorized'), data })
  }

  export function send400(res: Response, message?: unknown, data?: any) {
    return res.send({ code: 400, msg: _getSerializedString(message || 'invalid payload'), data })
  }

  export function send200(res: Response, message?: unknown, data?: any) {
    return res.send({ code: 200, msg: _getSerializedString(message || 'success'), data })
  }
}

export namespace HttpReq {
  export function getLocale(req: Request) {
    return !!req.headers['accept-language']
  }

  export function getCurrency(req: Request) {
    return req.headers['currency'] as string
  }

  export function getDevice(req: Request) {
    switch (req.headers['device']) {
      case Device.DESKTOP:
      case Device.MOBILE:
        return Device[req.headers['device']]
      case Device.UNKNOWN:
      default:
        return ''
    }
  }

  export function getToken(req: Request, opt?: { isBearer: boolean }) {
    if (opt && opt.isBearer === true || !opt) {
      const _parsed = req.headers.authorization?.split('Bearer ')
      if (_parsed && _parsed.length === 2) {
        return _parsed[1]
      }
    }
    return ''
  }

  export function getHeaders(req: Request) {
    const _device = getDevice(req)
    const _locale = getLocale(req)
    const _currency = getCurrency(req)
    const _token = getToken(req)

    return {
      device: _device,
      locale: _locale,
      currency: _currency,
      token: _token
    }
  }

  export function hasLocale(req: Request) {
    return Boolean(getLocale(req))
  }

  export function hasCurrency(req: Request) {
    return Boolean(getCurrency(req))
  }

  export function hasDevice(req: Request) {
    return Boolean(getDevice(req))
  }

  export function hasToken(req: Request) {
    return Boolean(getToken(req))
  }
}

// TODO still unusable
export namespace HttpProcess {
  interface Options {
    fnArgs?: any
    isFnAsync?: boolean
  }

  export async function commonErrorCatcher(req: Request, res: Response, next: NextFunction, businessLogicFn: Function, options?: Options) {
    try {
      if (options && options.isFnAsync) {
        await businessLogicFn(...options.fnArgs)
      } else if (options && !options.isFnAsync) {
        businessLogicFn(...options.fnArgs)
      } else {
        businessLogicFn(...options?.fnArgs)
      }
    } catch (e: unknown) {
      HttpRes.send500(res, (e as string).toString())
      return
    }
  }
}
