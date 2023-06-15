import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'
import { genDateNowWithoutLocalOffset } from '../utils/helpers'

namespace Record {
  export async function create(
    name: string,
    path: string,
    roles: string,
    tags: string,
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO record(name, path, roles, tags)
      VALUES($1, $2, $3, $4)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [name, path, roles, tags])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAll(name = ''): Promise<Array<any> | false> {
    let sql = `
      SELECT *
      FROM record
      ORDER BY last_updated DESC
    `

    if (name) {
      sql = `
        SELECT *
        FROM record
        WHERE name LIKE $1
        ORDER BY last_updated DESC
      `
    }

    try {
      const { rows } = await client.query(sql, name ? [`%${name}%`] : [])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAll Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function update(
    id: string,
    name: string,
    path: string,
    roles: string,
    tags: string,
  ): Promise<Array<any> | false> {
    const sql = `
      UPDATE record
      SET name = $2, path = $3, roles = $4, tags = $5, last_updated = $6
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, name, path, roles, tags, genDateNowWithoutLocalOffset()])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default Record
