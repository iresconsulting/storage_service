import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createSystemConfigTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS system_config (
      id bigserial PRIMARY KEY,
      root_usr text DEFAULT '',
      root_pwd text DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createSystemConfigTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createSystemConfigTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropSystemConfigTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE system_config
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropSystemConfigTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropSystemConfigTable error: ${(e as string).toString()}` })
    return false
  }
}
