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
      _rows = await Member.getByAccessLevel([AppAccessLevel.root, AppAccessLevel.root]) || []
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

router.post('/member', authMiddleware, async (req, res) => {
  try {
    const { accessLevel, email, action, id, value, galleryId, collectorId } = req.body
    if (action === 'status') {
      const _rows = await Member.updateByField(id, Member.UserFlagField.allowed_login_status, Boolean(value))
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    if (!isValidAdminAccessLevel(accessLevel)) {
      HttpRes.send400(res)
      return
    }
    const _isExist = await Member.getByEmail(email)
    if (_isExist && _isExist.length > 0) {
      HttpRes.send400(res, 'email already exist')
      return
    }
    const _id = galleryId || collectorId
    const _rows = await Member.create('', '', '', accessLevel, email, '', _id, '', '')
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

router.post('/verification', authMiddleware, async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)

    const _rows = await AdminWhiteList.getByEmail(email)
    if (!_rows || _rows.length === 0) {
      HttpRes.send400(res)
      return
    }

    const _isExist = await Member.getByEmail(email)
    if (_isExist && _isExist.length) {
      HttpRes.send200(res, 'success', { data: _isExist })
      return
    } else {
      HttpRes.send400(res)
      return
    }
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/whitelist', async (req, res) => {
  try {
    const _rows = await AdminWhiteList.getAllPagination()
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

router.post('/whitelist', async (req, res) => {
  try {
    const { accessLevel, email, action, id, value } = req.body
    if (action === 'status') {
      const _rows = await Member.updateByField(id, Member.UserFlagField.allowed_login_status, Boolean(value))
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    if (!isValidAdminAccessLevel(accessLevel)) {
      HttpRes.send400(res)
      return
    }
    const [isMember, isInWhitelist] = await Promise.all([
      Member.getByEmail(email),
      AdminWhiteList.getByEmail(email)
    ])

    if ((isMember && isMember.length > 0) || (isInWhitelist && isInWhitelist.length > 0)) {
      HttpRes.send400(res, 'email already exists')
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
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const _rows = await AdminWhiteList.getByEmail(email)
    if (!_rows || _rows.length === 0) {
      HttpRes.send400(res)
      return
    }
    const { access_level } = _rows[0]
    const _isExist = await Member.getByEmail(email)

    if (!_isExist || _isExist.length === 0) {
      const _result = await Member.create('', '', Firebase.Provider.GOOGLE, access_level, email, '', '', '', '')
      if (!_result) {
        HttpRes.send400(res)
        return
      }
      HttpRes.send200(res, 'success', { data: _result })
    } else {
      HttpRes.send200(res, 'success', { data: _isExist })
    }
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/user/info', authMiddleware, async (req, res) => {
  try {
    const { id } = req.query
    const _userId = id?.toString() || ''
    if (!_userId) {
      HttpRes.send400(res)
      return
    }
    const { fieldName, value } = req.body
    const _result = await Member.updateByField(_userId, fieldName as Member.UserFlagField, value.toString())
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
    const _result = await Member.updateByField(_userId, fieldName as Member.UserFlagField, value.toString())
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
