import Logger from "~/src/utils/logger"
import { client } from ".."
import { querySuccessHandler } from "./utils"

namespace PaypalSubProfile {
  export async function create(member_id: string, cancel_link: string, reactivate_link: string, suspend_link: string, set_balance_link: string, current_plan: string, payload: string): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO paypal_sub_profile(member_id, cancel_link, reactivate_link, suspend_link, set_balance_link, current_plan, payload)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [member_id, cancel_link, reactivate_link, suspend_link, set_balance_link, current_plan, payload])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByMemberId(member_id: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM paypal_sub_profile
      WHERE member_id = $1
    `

    try {
      const { rows } = await client.query(sql, [member_id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByMemberId Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function update(member_id: string, cancel_link: string, reactivate_link: string, suspend_link: string, set_balance_link: string, current_plan: string, payload: string): Promise<Array<any> | false> {
    let sql = ''
    if (cancel_link) {
      sql = `
        UPDATE paypal_sub_profile
        SET cancel_link = $1, reactivate_link = $2, suspend_link = $3, set_balance_link = $4, current_plan = $5, payload = $6
        WHERE member_id = $7
        RETURNING *
      `
    } else {
      sql = `
        UPDATE paypal_sub_profile
        SET reactivate_link = $2, suspend_link = $3, set_balance_link = $4, current_plan = $5, payload = $6
        WHERE member_id = $1
        RETURNING *
      `
    }

    const _payload = !cancel_link ? [member_id, reactivate_link, suspend_link, set_balance_link, current_plan, payload] : [cancel_link, reactivate_link, suspend_link, set_balance_link, current_plan, payload, member_id]

    try {
      const { rows } = await client.query(sql, _payload)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateAuthor Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateNextBillingDate(member_id: string, date: string): Promise<Array<any> | false> {
    let sql = `
      UPDATE paypal_sub_profile
      SET reactivate_link = $1
      WHERE member_id = $2
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [date, member_id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateAuthor Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default PaypalSubProfile
