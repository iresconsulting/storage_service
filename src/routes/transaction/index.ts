import express, { Router } from 'express'
import moment from 'moment'
import { Transaction } from '~/src/models/pg'
import DateCustomized from '~/src/utils/date'
import authMiddleware from '../middleware/auth'
import { HttpRes } from '../utils/http'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, userId, info } = req.query
    const _info = Boolean(info?.toString())
    const _startDate = startDate ? startDate.toString() : moment('2019-01-01').toISOString()
    const _endDate = endDate ? endDate.toString() : moment('2038-12-31').toISOString()
    const _userId = String(userId)

    if (!DateCustomized.isValid(_startDate) || !DateCustomized.isValid(_endDate)) {
      HttpRes.send400(res, 'input invalid')
      return
    }
    if (!DateCustomized.isValidRange({ startDate: _startDate, endDate: _endDate })) {
      HttpRes.send400(res, 'input invalid')
      return
    }
    const _queryPayload = { startDateIso: _startDate, endDateIso: _endDate }
    let _rows = []
    if (_userId) {
      _rows = await Transaction.getWithUserInfoInDateRangeByUserId({ ..._queryPayload, userId: _userId })
    } else if (_info) {
      _rows = await Transaction.getWithUserInfoInDateRange(_queryPayload)
    } else {
      _rows = await Transaction.getInDateRange(_queryPayload)
    }
    HttpRes.send200(res, 'success', { data: _rows })
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/', async (req, res) => {
  try {
    const { member_id, amount, direction, wallet_id } = req.body
    const _rows = await Transaction.create(
      member_id,
      Number(amount),
      direction,
      'system_payable_admin_to_artist',
      'system_payable_admin_to_artist',
      'system_payable_admin_to_artist',
      wallet_id
    )
    if (_rows) {
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    HttpRes.send500(res)
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

router.post('/checkout', async (req, res) => {
  try {
    const { id } = req.body
    const _rows = await Transaction.updateStatusById(id, true)
    if (_rows) {
      HttpRes.send200(res, 'success', { data: _rows })
      return
    }
    HttpRes.send500(res)
    return
  } catch (e: unknown) {
    HttpRes.send500(res)
    return
  }
})

export default router
