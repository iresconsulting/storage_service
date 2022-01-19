import Logger from '~/src/utils/logger'
import { client } from '..'
import { isRowsExist, genDateNowWithoutLocalOffset } from '../utils/helpers'
import { queryHandler, querySuccessHandler } from './utils'
import Wallet from './wallet'

namespace Transaction {
  export async function create(walletId: string, balanceBefore: number, balanceChange: number, direction: boolean, tag?: string, roundId?: string): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO transaction(wallet_id, balance_before, balance_after, balance_change, direction, created_at, last_updated, tag, round_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `
    const now = genDateNowWithoutLocalOffset()
    const balanceBeforeToNumber = Number(balanceBefore)
    const balanceChangeToNumber = Number(balanceChange)
    const _roundId = roundId || ''

    let t = ''
    if (tag !== undefined) {
      t = tag
    }

    if (!isNaN(balanceBeforeToNumber) && !isNaN(balanceChangeToNumber)) {
      const balanceAfter = direction === true ? balanceBeforeToNumber + balanceChangeToNumber : balanceBeforeToNumber - balanceChangeToNumber
      try {
        const walletUpdateResult = await Wallet.updateBalanceTotal(walletId, balanceChange, direction)
        if (!walletUpdateResult) {
          throw new Error(`Query: updateWalletBalance failed. balance cannot fall below 0`)
        }

        const { rows } = await client.query(sql, [walletId, balanceBefore, balanceAfter, balanceChange, direction, now, now, t, _roundId])

        if (isRowsExist(rows) && rows) {
          // await updateWalletBalance(walletId, balanceAfter)
          // console.log('[DB] create Success: ')
          // console.log(rows)
          return rows
        } else {
          throw new Error(`Query: ${sql} failed.`)
        }
      } catch (e: unknown) {
        // console.log('[DB] create Error: ' + (e as string).toString())
        return false
      }
    } else {
      return false
    }
  }

  // TODO
  export async function getAllPagination(): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM transaction
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAllPagination Error: ${(e as string).toString()}` })
      return false
    }
  }

  export async function getById(id: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM transaction
      WHERE id = $1
    `

    try {
      const { rows } = await client.query(sql, [id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAllPagination Error: ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByWalletId(walletId: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM transaction
      WHERE wallet_id = $1
    `

    try {
      const { rows } = await client.query(sql, [walletId])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByWalletId Error: ${(e as string).toString()}` })
      return false
    }
  }

  export async function getWithUserInfo(): Promise<Array<any> | false> {
    const sql = `
      SELECT transaction.id, transaction.tag, transaction.created_at, transaction.balance_change, transaction.balance_after, transaction.direction, sub_q1.balance as wallet_balance, sub_q1.user_email as user_email, sub_q1.uid as user_id, sub_q1.user_display as user_display
      FROM transaction
      LEFT JOIN (
        SELECT member.id as uid, member.email as user_email, member.username as user_display, wallet.balance_total as balance, wallet.id as wid
        FROM wallet
        LEFT JOIN member
        ON wallet.user_id = member.id
      ) sub_q1
      ON transaction.wallet_id = sub_q1.wid
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getWithUserInfo Error: ${(e as string).toString()}` })
      return false
    }
  }

  export async function getWithUserInfoByUserId(userId: string, startDateIso: string, endDateIso: string): Promise<Array<any> | false> {
    const sql = `
      SELECT transaction.id, transaction.tag, transaction.created_at, transaction.balance_change, transaction.balance_after, transaction.direction, sub_q1.balance as wallet_balance, sub_q1.uid as user_id, sub_q1.user_display as user_display
      FROM transaction
      LEFT JOIN (
        SELECT member.id as uid, member.email as user_email, member.username as user_display, wallet.balance_total as balance, wallet.id as wid
        FROM wallet
        LEFT JOIN member
        ON wallet.user_id = member.id
        WHERE wallet.user_id = $1
      ) sub_q1
      ON transaction.wallet_id = sub_q1.wid
      WHERE transaction.created_at >= $2 AND transaction.created_at <= $3 AND transaction.wallet_id = sub_q1.wid
    `

    try {
      const { rows } = await client.query(sql, [userId, startDateIso, endDateIso])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getWithUserInfo Error: ${(e as string).toString()}` })
      return false
    }
  }

  export async function getWithUserInfoInDateRange({ startDateIso, endDateIso }: { startDateIso: string, endDateIso: string }): Promise<Array<any>> {
    const sql = `
      SELECT transaction.id, transaction.tag, transaction.status, transaction.created_at, transaction.round_id, transaction.balance_change, transaction.balance_after, transaction.direction, sub_q1.balance as wallet_balance, sub_q1.user_email as user_email, sub_q1.uid as user_id, sub_q1.user_display as user_display
      FROM transaction
      LEFT JOIN (
        SELECT member.id as uid, member.email as user_email, member.username as user_display, wallet.balance_total as balance, wallet.id as wid
        FROM wallet
        LEFT JOIN member
        ON wallet.user_id = member.id
      ) sub_q1
      ON transaction.wallet_id = sub_q1.wid
      WHERE transaction.created_at >= $1 AND transaction.created_at <= $2
    `

    return queryHandler(sql, [startDateIso, endDateIso])
  }

  export async function deleteById(id: string): Promise<Array<any> | false> {
    const sql = `
      DELETE FROM transaction
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `deleteById Error: ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateStatusById(id: string, status: boolean): Promise<Array<any>> {
    const sql = `
      UPDATE transaction
      SET status = $2
      WHERE id = $1
      RETURNING *
    `
    return await queryHandler(sql, [id, status])
  }
}

export default Transaction

