import { AppAccessLevel } from './../../models/pg/models/access_level'
import express, { Router } from 'express'
import { Member } from '~/src/models/pg'
import { HttpReq, HttpRes } from '../utils/http'
import authMiddleware from '../middleware/auth'
import Firebase from '~/src/utils/firebase'
import { isValidAdminAccessLevel } from './utils'
import AdminWhiteList from '~/src/models/pg/controllers/admin_whitelist'

const router: Router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  let _rows = []
  try {
    const { userId } = req.query
    const _userId = userId?.toString() || ''
    if (!_userId) {
      _rows = await Member.getByAccessLevel([AppAccessLevel.admin1, AppAccessLevel.root]) || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    _rows = await Member.getById(_userId) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/member', authMiddleware, async (req, res) => {
  let _rows = []
  try {
    const { userId } = req.query
    const _userId = userId?.toString() || ''
    if (!_userId) {
      _rows = await Member.getByAccessLevel([AppAccessLevel.guest, AppAccessLevel.user]) || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    _rows = await Member.getById(_userId) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/verification', authMiddleware, async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const _rows = await AdminWhiteList.getByEmail(email)
    if (!_rows) {
      HttpRes.send400(res)
      return
    }
    const _result = await Member.updateByField(userId, Member.UserFlagField.accessToken, _token)
    if (!_result) {
      HttpRes.send400(res)
      return
    }
    HttpRes.send200(res, 'success', { data: _result })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/whitelist', async (req, res) => {
  try {
    const { accessLevel, email } = req.body
    if (!isValidAdminAccessLevel(accessLevel)) {
      HttpRes.send400(res)
      return
    }
    const _rows = await AdminWhiteList.create(email, accessLevel)
    if (!_rows) {
      HttpRes.send400(res)
      return
    }
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/creation', async (req, res) => {
  try {
    const { accessLevel, email } = req.body
    if (!isValidAdminAccessLevel(accessLevel)) {
      HttpRes.send400(res)
      return
    }
    const _rows = await AdminWhiteList.getByEmailAndAccessLevel(email, accessLevel)
    if (!_rows) {
      HttpRes.send400(res)
      return
    }
    const _result = await Member.create('', '', Firebase.Provider.GOOGLE, accessLevel, email, '', '', '', '')
    if (!_result) {
      HttpRes.send400(res)
      return
    }
    HttpRes.send200(res, 'success', { data: _result })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.query
    const _userId = userId?.toString() || ''
    if (!_userId) {
      HttpRes.send400(res)
      return
    }
    const { fieldName, value } = req.body
    const _result = await Member.updateByField(_userId, fieldName as Member.UserFlagField, value)
    if (!_result) {
      HttpRes.send400(res)
      return
    }
    HttpRes.send200(res, 'success', { data: _result })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

export default router
