import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'
import { genDateNowWithoutLocalOffset } from '../utils/helpers'

namespace SystemConfig {
  export async function create(
    root_usr: string,
    root_pwd: string,
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO system_config(root_usr, root_pwd)
      VALUES($1, $2)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [root_usr, root_pwd])
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
      FROM system_config
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

  export async function update(id: string, root_usr: string, root_pwd: string): Promise<Array<any> | false> {
    const sql = `
      UPDATE system_config
      SET root_usr = $2, root_pwd = $3, last_updated = $4
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, root_usr, root_pwd, genDateNowWithoutLocalOffset()])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default SystemConfig
