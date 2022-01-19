import Logger from '~/src/utils/logger'
import { client } from '..'
import { genDateNowWithoutLocalOffset } from '../utils/helpers'
import { querySuccessHandler } from './utils'

namespace Wallet {
  export async function create(userId: string): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO wallet(balance_total, created_at, last_updated, user_id)
      VALUES($1, $2, $3, $4)
      RETURNING *
    `
    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [0, now, now, userId])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByUserId(userId: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM wallet
      WHERE user_id = $1
    `

    try {
      const { rows } = await client.query(sql, [userId])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByUserId Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function deleteById(id: string): Promise<Array<any> | false> {
    const sql = `
      DELETE FROM wallet
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `deleteById Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function deleteByUserId(id: string): Promise<Array<any> | false> {
    const sql = `
      DELETE FROM wallet
      WHERE user_id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `deleteByUserId Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateBalanceTotal(id: string, amount: number, direction: boolean): Promise<Array<any> | false> {
    let sql = `
      UPDATE wallet
      SET balance_total = balance_total + $2, last_updated = $3
      WHERE id = $1 AND active_status = true
      RETURNING *
    `

    if (!direction) {
      sql = `
        UPDATE wallet
        SET balance_total = balance_total - $2, last_updated = $3
        WHERE id = $1 AND active_status = true AND balance_total > 0
        RETURNING *
      `
    }

    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [id, Number(amount), now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateBalanceTotal Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateReferralTotal(id: string, amount: number, direction: boolean): Promise<Array<any> | false> {
    let sql = `
      UPDATE wallet
      SET referral_total = referral_total + $2, last_updated = $3
      WHERE id = $1 AND active_status = true
      RETURNING *
    `

    if (!direction) {
      sql = `
        UPDATE wallet
        SET referral_total = referral_total - $2, last_updated = $3
        WHERE id = $1 AND active_status = true AND referral_total > 0
        RETURNING *
      `
    }

    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [id, Number(amount), now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateReferralTotal Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateBonusTotal(id: string, amount: number, direction: boolean): Promise<Array<any> | false> {
    let sql = `
      UPDATE wallet
      SET bonus_total = bonus_total + $2, last_updated = $3
      WHERE id = $1 AND active_status = true
      RETURNING *
    `

    if (!direction) {
      sql = `
        UPDATE wallet
        SET bonus_total = bonus_total - $2, last_updated = $3
        WHERE id = $1 AND active_status = true AND bonus_total > 0
        RETURNING *
      `
    }

    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [id, Number(amount), now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateBonusTotal Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateGasDeductionPercentage(id: string, amount: number, direction: boolean): Promise<Array<any> | false> {
    let sql = `
      UPDATE wallet
      SET gas_deduction_percentage = gas_deduction_percentage + $2, last_updated = $3
      WHERE id = $1 AND active_status = true
      RETURNING *
    `

    if (!direction) {
      sql = `
        UPDATE wallet
        SET gas_deduction_percentage = gas_deduction_percentage - $2, last_updated = $3
        WHERE id = $1 AND active_status = true AND gas_deduction_percentage > 0
        RETURNING *
      `
    }

    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [id, Number(amount), now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateGasDeductionPercentage Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateActiveStatusById(id: string, status: boolean): Promise<Array<any> | false> {
    const sql = `
      UPDATE wallet
      SET active_status = $2, last_updated = $3
      WHERE id = $1
      RETURNING *
    `
    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [id, status, now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateActiveStatusById Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateActiveStatusByUserId(userId: string, status: boolean): Promise<Array<any> | false> {
    const sql = `
      UPDATE wallet
      SET active_status = $2, last_updated = $3
      WHERE user_id = $1
      RETURNING *
    `
    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [userId, status, now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateActiveStatusByUserId Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function resetBalanceAll(): Promise<Array<any> | false> {
    const sql = `
      UPDATE wallet
      SET balance_total = 0, last_updated = $1
      RETURNING *
    `
    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `resetBalanceAll Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateBalanceTotalSet(id: string, amount: number): Promise<Array<any> | false> {
    let sql = `
      UPDATE wallet
      SET balance_total = $2, last_updated = $3
      WHERE id = $1 AND active_status = true
      RETURNING *
    `
    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [id, Number(amount), now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateBalanceTotalSet Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateReferralTotalSet(id: string, amount: number): Promise<Array<any> | false> {
    let sql = `
      UPDATE wallet
      SET referral_total = $2, last_updated = $3
      WHERE id = $1 AND active_status = true
      RETURNING *
    `
    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [id, Number(amount), now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateReferralTotalSet Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateBonusTotalSet(id: string, amount: number): Promise<Array<any> | false> {
    let sql = `
      UPDATE wallet
      SET bonus_total = $2, last_updated = $3
      WHERE id = $1 AND active_status = true
      RETURNING *
    `
    const now = genDateNowWithoutLocalOffset()

    try {
      const { rows } = await client.query(sql, [id, Number(amount), now])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateBonusTotalSet Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default Wallet
