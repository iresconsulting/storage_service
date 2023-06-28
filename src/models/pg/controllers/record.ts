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
    folder_id?: string
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO record(name, path, roles, tags, folder_id)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [name, path, roles, tags, folder_id || ''])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAll(name?: string, folder_id?: string): Promise<Array<any> | false> {
    let sql = `
      SELECT *
      FROM record
      WHERE folder_id = ''
      ORDER BY last_updated DESC
    `

    if (name) {
      sql = `
        SELECT *
        FROM record
        WHERE name LIKE $1
        ORDER BY last_updated DESC
      `
    } else if (folder_id) {
      sql = `
        SELECT *
        FROM record
        WHERE folder_id = $1
        ORDER BY last_updated DESC
      `
    }

    try {
      const { rows } = await client.query(sql, name ? [`%${name}%`] : folder_id ? [folder_id] : [])
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

  export async function updateFolder(
    id: string,
    folder_id: string,
  ): Promise<Array<any> | false> {
    const sql = `
      UPDATE record
      SET folder_id = $2, last_updated = $3
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, folder_id, genDateNowWithoutLocalOffset()])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function hide(
    id: string,
    hidden: boolean,
  ): Promise<Array<any> | false> {
    const sql = `
      UPDATE record
      SET hidden = $2, last_updated = $3
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, hidden, genDateNowWithoutLocalOffset()])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `hide Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default Record
