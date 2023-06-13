import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'
import { genDateNowWithoutLocalOffset } from '../utils/helpers'

namespace Record {
  export async function create(
    name: string,
    path: string,
    roles: string,
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO record(name, path, roles)
      VALUES($1, $2, $3)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [name, path, roles])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAll(): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM record
      ORDER BY last_updated DESC
    `

    try {
      const { rows } = await client.query(sql)
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
  ): Promise<Array<any> | false> {
    const sql = `
      UPDATE record
      SET name = $2, last_updated = $3
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, name, path, roles, genDateNowWithoutLocalOffset()])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default Record
