import { Request, Response } from 'express'
// import Firebase from '~/src/utils/firebase'
import Logger from '~/src/utils/logger'
import { HttpReq, HttpRes } from '../utils/http'

export default async function authMiddleware(req: Request, res: Response, next: Function): Promise<void> {
  try {
    const _token = HttpReq.getToken(req, { isBearer: true })
    // const isTokenValid = await Firebase.verifyToken(_token)
    const isTokenValid = true
    if (!isTokenValid) {
      HttpRes.send401(res)
      return
    } else {
      // TODO userId usage
      // const { user_id, email } = await Firebase.authenticateToken(_token)
      // const checkUserExist = await Member.getByUsername(email)
      // if (!checkUserExist) {
      //   HttpRes.send400(res)
      //   return
      // }
      next()
    }
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.FIREBASE, message: `${(e as string).toString()}` })
    HttpRes.send401(res)
  }
}
