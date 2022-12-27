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
      // get regular users (1-2)
      _rows = await Member.getByAccessLevel([AppAccessLevel.guest, AppAccessLevel.user]) || []
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
      const _memberInfo = await MemberInfo.getById(_userId)
      const _awardInfo = await MemberAward.getAllPagination(_userId) || []
      if (_memberInfo && _memberInfo.length) {
        if (_memberInfo[0].category) {
          _memberInfo[0].category = pgArrToArr(_memberInfo[0].category)
        }
        if (_memberInfo[0].tag) {
          _memberInfo[0].tag = pgArrToArr(_memberInfo[0].tag)
        }
        HttpRes.send200(res, 'success', { data: { awards: _awardInfo, info: _memberInfo[0] } })
        return
      } else if (_awardInfo && _awardInfo.length) {
        HttpRes.send200(res, 'success', { data: { awards: _awardInfo, info: { name: '', origin: '', birthday: '', about: '' } } })
        return
      }
    }
    HttpRes.send200(res, 'success', { data: { awards: [], info: { name: '', origin: '', birthday: '', about: '' } } })
    return
  } catch (e: any) {
    HttpRes.send500(res, String(e))
    return
  }
})

router.post('/info', authMiddleware, async (req, res) => {
  try {
    const { userId, name, origin, birthday, about } = req.body
    const _memberInfo = await MemberInfo.getById(userId)
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

router.post('/info/award', async (req, res) => {
  try {
    const { userId, award_name, award_type, award_year, itemId } = req.body
    const _awardInfo = await MemberAward.getById(itemId)
    const _type = award_type as AwardType
    if (_type !== 'expo' && _type !== 'award' && _type !== 'event') {
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

router.post('/info/tag', async (req, res) => {
  try {
    const { value, userId } = req.body
    const _rows = await MemberInfo.updateTag({ value, member_id: userId })
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info/status/featured', async (req, res) => {
  try {
    const { value, userId } = req.body
    const _rows = await MemberInfo.updateFeatured({ value, member_id: userId })
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/info/status/main', async (req, res) => {
  try {
    const { value, userId } = req.body
    const _rows = await MemberInfo.updateMain({ value, member_id: userId })
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/artists', async (req, res) => {
  try {
    const { galleryId, collectorId } = req.query
    const _galleryId = String(galleryId)
    const _collectorId = String(collectorId)
    if (_galleryId !== 'undefined') {
      const _rows = await Member.getByGalleryId(_galleryId)
      HttpRes.send200(res, 'success', { data: _rows })
      return
    } else if (_collectorId !== 'undefined') {
      const _rows = await Member.getByGalleryId(_collectorId)
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    const _rows = await Member.getArtists() || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/artists/info', async (req, res) => {
  try {
    const { id, type } = req.query
    const _id = String(id)
    const _type = String(type)
    let _rows = []
    if (!isNaN(Number(id))) {
      _rows = await MemberInfo.getById(_id) || []
      if (_rows && _rows.length) {
        const _awards = await MemberAward.getAllPagination(_id) || []
        _rows[0].awards = _awards
        _rows = _rows.map((item) => {
          return {
            ...item,
            category: item.category && !item.category.includes('NULL') ? pgArrToArr(item.category) : [],
            tag: item.tag && !item.tag.includes('NULL') ? pgArrToArr(item.tag) : [],
            gallery_tag: item.gallery_tag && !item.gallery_tag.includes('NULL') ? pgArrToArr(item.gallery_tag) : []
          }
        })
      }
      HttpRes.send200(res, 'success', { data: _rows })
      return
    } else if (_type === 'main') {
      _rows = await MemberInfo.getMain() || []
    } else if (_type === 'featured') {
      _rows = await MemberInfo.getFeatured() || []
    } else if (_type === 'featured_galleries') {
      _rows = await MemberInfo.getFeaturedGalleries() || []
    } else if (_type === 'main_galleries') {
      _rows = await MemberInfo.getMainGalleries() || []
    } else {
      _rows = await MemberInfo.getAll() || []
    }

    // map category
    _rows = _rows.map((item) => {
      return {
        ...item,
        category: item.category && !item.category.includes('NULL') ? pgArrToArr(item.category) : [],
        tag: item.tag && !item.tag.includes('NULL') ? pgArrToArr(item.tag) : []
      }
    })

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
    const _result = await Member.create(_token, '', Firebase.Provider.GOOGLE, AppAccessLevel.admin3, email, '', '', '', '', false)
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

router.get('/gallery', async (req, res) => {
  let _rows = []
  try {
    const { galleryId } = req.query
    const _galleryId = galleryId?.toString() || ''
    if (!_galleryId) {
      _rows = await Member.getGalleryInfo() || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    _rows = await Member.getGalleryInfoById(_galleryId) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/gallery', async (req, res) => {
  try {
    const { galleryId } = req.query
    const { name, origin, about, birthday, avatar } = req.body
    const _galleryId = galleryId?.toString() || ''
    if (!_galleryId) {
      HttpRes.send400(res)
      return
    }
    const exist = await MemberInfo.getById(_galleryId)
    if (exist && exist.length) {
      if (exist[0].access_level !== AppAccessLevel.admin2) {
        HttpRes.send400(res)
        return
      }
      let _rows = await MemberInfo.update({ name, origin, about, birthday, member_id: _galleryId }) || []
      if (avatar) {
        const fileName = _galleryId + moment().format('YYYYMMDDhh:mm:ss')
        const response = await imagekit.upload({ file: avatar, fileName })
        _rows = await MemberInfo.updateAvatar({ member_id: _galleryId, avatar: response?.url }) || []
      }
      HttpRes.send200(res, 'success', { data: _rows })
      return
    } else {
      let _rows = await MemberInfo.create({ name, origin, about, birthday, member_id: _galleryId })
      if (avatar) {
        const fileName = _galleryId + moment().format('YYYYMMDDhh:mm:ss')
        const response = await imagekit.upload({ file: avatar, fileName })
        _rows = await MemberInfo.updateAvatar({ member_id: _galleryId, avatar: response?.url }) || []
      }
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.get('/collector', async (req, res) => {
  let _rows = []
  try {
    const { collectorId } = req.query
    const _collectorId = collectorId?.toString() || ''
    if (!_collectorId) {
      _rows = await Member.getCollectorInfo() || []
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    _rows = await Member.getCollectorInfoById(_collectorId) || []
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/collector', async (req, res) => {
  try {
    const { collectorId } = req.query
    const { name, origin, about, birthday, avatar } = req.body
    const _collectorId = collectorId?.toString() || ''
    if (!_collectorId) {
      HttpRes.send400(res)
      return
    }
    const exist = await MemberInfo.getById(_collectorId)
    if (exist && exist.length) {
      if (exist[0].access_level !== AppAccessLevel.admin1) {
        HttpRes.send400(res)
        return
      }
      let _rows = await MemberInfo.update({ name, origin, about, birthday, member_id: _collectorId }) || []
      if (avatar) {
        const fileName = _collectorId + moment().format('YYYYMMDDhh:mm:ss')
        const response = await imagekit.upload({ file: avatar, fileName })
        _rows = await MemberInfo.updateAvatar({ member_id: _collectorId, avatar: response?.url }) || []
      }
      HttpRes.send200(res, 'success', { data: _rows })
      return
    } else {
      let _rows = await MemberInfo.create({ name, origin, about, birthday, member_id: _collectorId })
      if (avatar) {
        const fileName = _collectorId + moment().format('YYYYMMDDhh:mm:ss')
        const response = await imagekit.upload({ file: avatar, fileName })
        _rows = await MemberInfo.updateAvatar({ member_id: _collectorId, avatar: response?.url }) || []
      }
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

export default router
