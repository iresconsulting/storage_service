import { AppAccessLevel } from './../models/access_level';
import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'

namespace AdminWhiteList {
  export async function create(
    email: string
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO admin_whitelist(email)
      VALUES($1)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [email])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAllPagination(): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM admin_whitelist
      ORDER BY last_updated DESC
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
      WHERE email = $1 AND access_level = $2
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
