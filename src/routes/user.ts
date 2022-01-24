import { AppAccessLevel } from './../models/pg/models/access_level';
import express, { Router, Request, Response } from 'express'
import { Member } from '../models/pg'
import Firebase from '../utils/firebase'
import Validator from '../utils/validator'
import authMiddleware from './middleware/auth'
import { HttpReq, HttpRes } from './utils/http'

const router: Router = express.Router()

router.get('/signIn', authMiddleware, async (req, res) => {
  try {
    HttpRes.send200(res)
    return
  } catch (e: unknown) {
    HttpRes.send500(res, (e as string).toString())
    return
  }
})

router.post('/signUp', async (req, res) => {
  try {
    const _token = HttpReq.getToken(req, { isBearer: true })
    const _isTokenValid = await Firebase.verifyToken(_token)
    if (!_isTokenValid) {
      HttpRes.send401(res)
      return
    } else {
      // TODO userId usage
      const { user_id, email, sign_in_provider, name, picture, email_verified, phone_number } = await Firebase.authenticateToken(_token)
      if (await Member.getByEmail(email)) {
        throw new Error('email exists')
      } else {
        if (!Validator.email(email)) {
          throw new Error('email invalid')
        }
        const create = await Member.create(_token, '', sign_in_provider, AppAccessLevel.user, email, '', picture, name, phone_number)
        if (create) {
          HttpRes.send200(res, create)
          return
        }
        throw new Error('create user instance error')
      }
    }
  } catch (e: unknown) {
    const _err = (e as string).toString()
    switch ((e as string)) {
      case 'email invalid':
      case 'email exists':
        HttpRes.send400(res, _err)
        return
      default:
        HttpRes.send500(res, _err)
        return
    }
    return
  }
})

export default router
