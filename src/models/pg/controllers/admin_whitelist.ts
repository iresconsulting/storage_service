import { AppAccessLevel } from './../models/access_level'
import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'

namespace AdminWhiteList {
  export async function create(
    email: string,
    accessLevel: AppAccessLevel
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO admin_whitelist(email, access_level)
      VALUES($1, $2)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [email, accessLevel])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAllPagination(): Promise<Array<any> | false> {
    const sql = `
      SELECT
        admin_whitelist.email as email,
        admin_whitelist.access_level as access_level,
        admin_whitelist.created_at as created_at,
        member.allowed_login_status as status,
        member.id as id
      FROM admin_whitelist
      LEFT JOIN member on admin_whitelist.email = member.email
      WHERE admin_whitelist.access_level = '6' OR  admin_whitelist.access_level = '4' OR admin_whitelist.access_level = '3'
      ORDER BY admin_whitelist.last_updated DESC
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAllPagination Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByEmail(email: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM admin_whitelist
      WHERE email = $1
      ORDER BY last_updated DESC
    `

    try {
      const { rows } = await client.query(sql, [email])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByEmail Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByEmailAndAccessLevel(email: string, accessLevel: AppAccessLevel): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM admin_whitelist
      WHERE email = $1 AND access_level = $2
      ORDER BY last_updated DESC
    `

    try {
      const { rows } = await client.query(sql, [email, accessLevel])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByEmailAndAccessLevel Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default AdminWhiteList
