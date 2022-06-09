import Logger from '~/src/utils/logger'
import { client } from '..'
import { isRowsExist } from '../utils/helpers'
import { queryHandler, querySuccessHandler } from './utils'

namespace Transaction {
  export async function create(memberId: string, balanceChange: number, direction: boolean, tag?: string, description?: string, gas?: string, wallet_id?: string): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO transaction(member_id, amount, direction, tag, description, status, gas, wallet_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    const _amount = Number(balanceChange)
    const _tag = tag || ''
    const _description = description || ''
    const _gas = gas || ''
    const _wallet_id = wallet_id || ''

    if (isNaN(_amount)) {
      return false
    }

    try {
      const { rows } = await client.query(sql, [memberId, _amount, direction, _tag, _description, false, _gas, _wallet_id])
      if (isRowsExist(rows) && rows) {
        return rows
      } else {
        throw new Error(`Query: ${sql} failed.`)
      }
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error: ${(e as string).toString()}` })
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
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getById Error: ${(e as string).toString()}` })
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
      SELECT transaction.id, transaction.tag, transaction.status, transaction.created_at, transaction.amount, transaction.direction, sub_q1.balance as wallet_balance, sub_q1.user_email as user_email, sub_q1.uid as user_id, sub_q1.user_display as user_display
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

  export async function getWithUserInfoInDateRangeByUserId({ userId, startDateIso, endDateIso }: { userId: string, startDateIso: string, endDateIso: string }): Promise<Array<any>> {
    const sql = `
      SELECT transaction.gas, transaction.description, transaction.id, transaction.tag, transaction.status, transaction.created_at, transaction.amount, transaction.direction, sub_q1.balance as wallet_balance, sub_q1.user_email as user_email, sub_q1.uid as user_id, sub_q1.user_display as user_display
      FROM transaction
      LEFT JOIN (
        SELECT member.id as uid, member.email as user_email, member.username as user_display, wallet.balance_total as balance, wallet.id as wid
        FROM wallet
        LEFT JOIN member
        ON wallet.user_id = member.id AND member.id = $3
      ) sub_q1
      ON transaction.wallet_id = sub_q1.wid
      WHERE transaction.created_at >= $1 AND transaction.created_at <= $2
      ORDER BY transaction.created_at
      DESC
    `

    return queryHandler(sql, [startDateIso, endDateIso, userId])
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

  export async function getInDateRange({ startDateIso, endDateIso }: { startDateIso: string, endDateIso: string }): Promise<Array<any>> {
    const sql = `
      SELECT transaction.id, transaction.tag, transaction.status, transaction.created_at, transaction.round_id, transaction.balance_change, transaction.balance_after, transaction.direction, sub_q1.balance as wallet_balance, sub_q1.user_email as user_email, sub_q1.uid as user_id, sub_q1.user_display as user_display
      FROM transaction
      WHERE transaction.created_at >= $1 AND transaction.created_at <= $2
    `

    return queryHandler(sql, [startDateIso, endDateIso])
  }
}

export default Transaction
