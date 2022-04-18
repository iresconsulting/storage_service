import { AppAccessLevel } from './../../models/pg/models/access_level'
import express, { Router } from 'express'
import { Member } from '~/src/models/pg'
import { HttpReq, HttpRes } from '../utils/http'
import authMiddleware from '../middleware/auth'
import Firebase from '~/src/utils/firebase'
import MemberAddress from '~/src/models/pg/controllers/member_address'
import MemberInfo from '~/src/models/pg/controllers/member_info'
import MemberAward, { AwardType } from '~/src/models/pg/controllers/member_award'

const router: Router = express.Router()

router.post('/registration', async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const _result = await Member.create(_token, '', Firebase.Provider.GOOGLE, AppAccessLevel.user, email, '', '', '', '')
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

router.get('/', authMiddleware, async (req, res) => {
  let _rows = []
  try {
    const { userId } = req.query
    const _userId = userId?.toString() || ''
    if (!_userId) {
      // get regular users (1-4)
      _rows = await Member.getByAccessLevel([AppAccessLevel.guest, AppAccessLevel.admin2]) || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    _rows = await Member.getByIdWithAddressInfo(_userId) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/info', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.query
    const _userId = String(userId)
    if (_userId !== 'undefined') {
      const _memberInfo = await MemberInfo.getAllPagination(_userId)
      const _awardInfo = await MemberAward.getAllPagination(_userId)
      if (_memberInfo && _memberInfo.length) {
        HttpRes.send200(res, 'success', { awards: _awardInfo, info: _memberInfo[0] })
        return
      }
    }
    HttpRes.send200(res, 'success', { awards: [], info: { name: '', origin: '', birthday: '' } })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info', authMiddleware, async (req, res) => {
  try {
    const { userId, name, origin, birthday } = req.body
    const _memberInfo = await MemberInfo.getAllPagination(userId)
    if (_memberInfo && _memberInfo.length) {
      const _rows = await MemberInfo.update({ member_id: userId, name, origin, birthday }) || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    const _rows = await MemberInfo.create({ member_id: userId, name, origin, birthday }) || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info/award', authMiddleware, async (req, res) => {
  try {
    const { userId, name, type, year, itemId } = req.body
    const _awardInfo = await MemberAward.getAllPagination(itemId)
    const _type = type as AwardType
    if (type !== 'expo' || type !== 'award') {
      HttpRes.send400(res)
      return
    }
    if (_awardInfo && _awardInfo.length) {
      const _rows = await MemberAward.update({ item_id: itemId, name, type: _type, year }) || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    const _rows = await MemberAward.create({ member_id: userId, name, type: _type, year }) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/artists', authMiddleware, async (req, res) => {
  try {
    const _rows = await Member.getByAccessLevelAndWalletInfo([AppAccessLevel.admin3, AppAccessLevel.admin3]) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/artists', authMiddleware, async (req, res) => {
  try {
    const { wallet_address, user_id } = req.body
    const _rows = await Member.updateByField(user_id, Member.UserFlagField.provider, wallet_address)
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/artists/registration', async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const _isExist = await Member.getByEmail(email)
    if (!_isExist) {
      throw new Error('system error')
    }
    if (_isExist && _isExist.length) {
      HttpRes.send400(res, 'account already exist')
      return
    }
    const _result = await Member.create(_token, '', Firebase.Provider.GOOGLE, AppAccessLevel.admin3, email, '', '', '', '')
    if (!_result || !_result.length) {
      throw new Error('system error')
    }
    HttpRes.send200(res, 'success', { data: _result })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/artists/signIn', async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const _isExist = await Member.getByEmail(email)
    if (_isExist && _isExist.length) {
      const [acc] = _isExist
      if (acc.access_level === AppAccessLevel.admin3) {
        HttpRes.send200(res, 'success', { data: _isExist })
        return
      }
    }
    HttpRes.send400(res)
      return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/artists/verification', authMiddleware, async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const _isExist = await Member.getByEmail(email)
    if (_isExist && _isExist.length) {
      const [acc] = _isExist
      if (acc.access_level === AppAccessLevel.admin3) {
        HttpRes.send200(res, 'success', { data: _isExist })
        return
      } else {
        HttpRes.send400(res)
        return
      }
    } else {
      HttpRes.send400(res)
      return
    }
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/verification', authMiddleware, async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const _result = await Member.updateByField(userId, Member.UserFlagField.access_token, _token)
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
    const _token = HttpReq.getToken(req)
    const { user_id: userId } = await Firebase.authenticateToken(_token)
    const { fieldName, value } = req.body
    let _fieldName = fieldName
    switch (fieldName) {
      case Member.UserFlagField.carrier_number:
      case Member.UserFlagField.identification_gov_issued_number:
        break
      default:
        HttpRes.send400(res)
        return
    }
    const _result = await Member.updateByField(userId, _fieldName as Member.UserFlagField, value)
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

router.post('/address', authMiddleware, async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: member_id } = await Firebase.authenticateToken(_token)
    const { address_line_one, address_line_two, address_line_three, postal_code, city, district, id } = req.body
    const _id = String(id)
    let rows = []
    if (_id === 'undefined') {
      rows = await MemberAddress.create({ address_line_one, address_line_two, address_line_three, postal_code, city, district, member_id }) || []
    } else {
      rows = await MemberAddress.update({ address_line_one, address_line_two, address_line_three, postal_code, city, district, member_id }) || []
    }
    if (rows && rows.length) {
      HttpRes.send200(res, 'success', { data: rows })
      return
    }
    throw new Error('upsert error')
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

export default router
