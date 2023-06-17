import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'
import { genDateNowWithoutLocalOffset } from '../utils/helpers'

namespace Folder {
  export async function create(
    name: string,
    parent_name?: string | null,
    parent_id?: string | null,
    password?: string,
    hidden?: boolean,
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO folder(name, parent_name, parent_id, password, hidden)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [name, parent_name || '', parent_id || null, password || '', hidden || false])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAll(name?: string, id?: string | null): Promise<Array<any> | false> {
    // let sql = `
    //   SELECT *
    //   FROM folder
    //   ORDER BY last_updated DESC
    // `

    let sql = `
      SELECT *
      FROM folder
      ORDER BY name ASC
    `

    if (name) {
      sql = `
        SELECT *
        FROM folder
        WHERE name LIKE $1
        ORDER BY name ASC
      `
    } else if (id) {
      sql = `
        SELECT *
        FROM folder
        WHERE parent_id = $1
        ORDER BY name ASC
      `
    }

    try {
      const { rows } = await client.query(sql, name ? [`%${name}%`] : id || id === null ? [id] : [])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAll Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function update(
    id: string,
    name?: string,
    parent_name?: string | null,
    parent_id?: string | null,
    password?: string,
    hidden?: boolean,
  ): Promise<Array<any> | false> {
    const sql = `
      UPDATE folder
      SET name = $2, parent_name = $3, parent_id = $4, password = $5, hidden = $6, last_updated = $7
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, name || '', parent_name || '', parent_id || null, password, hidden || false, genDateNowWithoutLocalOffset()])
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
      UPDATE folder
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

export default Folder
