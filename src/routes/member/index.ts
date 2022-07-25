import { AppAccessLevel } from './../../models/pg/models/access_level'
import express, { Router } from 'express'
import { Member } from '~/src/models/pg'
import { HttpReq, HttpRes } from '../utils/http'
import authMiddleware from '../middleware/auth'
import Firebase from '~/src/utils/firebase'
import MemberAddress from '~/src/models/pg/controllers/member_address'
import MemberInfo from '~/src/models/pg/controllers/member_info'
import MemberAward, { AwardType } from '~/src/models/pg/controllers/member_award'
import PaypalSubProfile from '~/src/models/pg/controllers/paypal_sub_profile'
import { genSysMsg, sendMessage } from '~/src/utils/discord'
import { arrToPgArr, pgArrToArr, pgArrToArr2 } from '~/src/models/pg/utils/helpers'
import moment from 'moment'
import ImageKit from 'imagekit'

const router: Router = express.Router()

router.post('/user/registration', async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const isExist = await Member.getByEmail(email)
    if (isExist && isExist.length) {
      HttpRes.send400(res, 'email already registered')
      return
    }
    const _result = await Member.create(_token, '', Firebase.Provider.GOOGLE, AppAccessLevel.user, email, '', '', '', '')
    if (!_result) {
      HttpRes.send500(res)
      return
    }
    HttpRes.send200(res, 'success', { data: _result })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/user/verification', authMiddleware, async (req, res) => {
  try {
    const _token = HttpReq.getToken(req)
    const { user_id: userId, email } = await Firebase.authenticateToken(_token)
    const isExist = await Member.getByEmail(email)
    let _userId = ''
    if (isExist && isExist.length) {
      _userId = isExist[0].id
    } else {
      HttpRes.send400(res)
      return
    }
    const _result = await Member.updateByField(_userId, Member.UserFlagField.access_token, _token)
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

router.get('/info', async (req, res) => {
  try {
    const { userId } = req.query
    const _userId = String(userId)
    if (_userId !== 'undefined') {
      const _memberInfo = await MemberInfo.getAllPagination(_userId)
      const _awardInfo = await MemberAward.getAllPagination(_userId) || []
      if (_memberInfo && _memberInfo.length) {
        _memberInfo[0].category = pgArrToArr(_memberInfo[0].category)
        HttpRes.send200(res, 'success', { data: { awards: _awardInfo, info: _memberInfo[0] } })
        return
      }
    }
    HttpRes.send200(res, 'success', { data: { awards: [], info: { name: '', origin: '', birthday: '' } } })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info', authMiddleware, async (req, res) => {
  try {
    const { userId, name, origin, birthday, about } = req.body
    const _memberInfo = await MemberInfo.getAllPagination(userId)
    if (_memberInfo && _memberInfo.length) {
      const _rows = await MemberInfo.update({ member_id: userId, name, origin, birthday, about }) || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    const _rows = await MemberInfo.create({ member_id: userId, name, origin, birthday, about }) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

const imagekit = new ImageKit({
  publicKey: 'public_teDOnhzTMWCZZ4AGiQIjaw2yy+4=',
  privateKey: 'private_St3OeJ2AP6qBqE4gkp+zyY5u48I=',
  urlEndpoint: "https://ik.imagekit.io/lrouh8y6a"
})

router.post('/info/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatar, userId } = req.body
    const fileName = userId + moment().format('YYYYMMDDhh:mm:ss')
    const response = await imagekit.upload({ file: avatar, fileName })
    const _rows = await MemberInfo.updateAvatar({ avatar: response?.url, member_id: userId })
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info/award', authMiddleware, async (req, res) => {
  try {
    const { userId, award_name, award_type, award_year, itemId } = req.body
    const _awardInfo = await MemberAward.getAllPagination(itemId)
    const _type = award_type as AwardType
    if (_type !== 'expo' && _type !== 'award') {
      HttpRes.send400(res)
      return
    }
    if (_awardInfo && _awardInfo.length) {
      const _rows = await MemberAward.update({ item_id: itemId, name: award_name, type: _type, year: award_year }) || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    const _rows = await MemberAward.create({ member_id: userId, name: award_name, type: _type, year: award_year }) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info/plan', authMiddleware, async (req, res) => {
  try {
    const { plan, userId } = req.body
    const _rows = await Member.updatePlan(userId, plan)
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info/category', async (req, res) => {
  try {
    const { category, userId } = req.body
    const _rows = await MemberInfo.updateCategory({ category, member_id: userId })
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/artists', authMiddleware, async (req, res) => {
  try {
    const { galleryId } = req.query
    const _galleryId = String(galleryId)
    if (_galleryId !== 'undefined') {
      const _rows = await Member.getByGalleryId(_galleryId)
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    const _rows = await Member.getByAccessLevelAndWalletInfo([AppAccessLevel.admin3, AppAccessLevel.admin3]) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/artists/info', async (req, res) => {
  try {
    const { id } = req.query
    const _id = String(id)
    let _rows = []
    if (_id === 'undefined') {
      _rows = await MemberInfo.getAll() || []
      _rows = _rows.map((item) => {
        return {
          ...item,
          category: item.category && !item.category.includes('NULL') ? pgArrToArr(item.category) : []
        }
      })

    } else {
      _rows = await MemberInfo.getById(_id) || []
      if (_rows && _rows.length) {
        const _awards = await MemberAward.getAllPagination(_id) || []
        _rows[0].awards = _awards
      }
    }
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
    await MemberInfo.create({ member_id: _result[0].id, name: '', origin: '', birthday: '', about: '' }) || []
    await PaypalSubProfile.create(_result[0].id, '', '', '', '', '', '')
    sendMessage(genSysMsg('User Creation', email))
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
