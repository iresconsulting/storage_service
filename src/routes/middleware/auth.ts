import { Request, Response } from 'express'
import { HttpRes } from '../utils/http'

export default function authMiddleware(req: Request, res: Response, next: Function): void {
  try {
    // const token = authHeaderParser(req)
    // const decoded = decodeJWT(token, 'qapi')
    // const userId = getUserId(decoded)
    // req.headers.userId = userId
    next()
  } catch (e: unknown) {
    HttpRes.send401(res)
  }
}
