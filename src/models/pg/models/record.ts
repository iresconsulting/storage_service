import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createRecordTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS record (
      id bigserial PRIMARY KEY,
      name text DEFAULT '',
      path text DEFAULT '',
      roles text DEFAULT '',
      tags text DEFAULT '',
      hidden boolean DEFAULT false,
      folder_id text DEFAULT '',
      mimetype text DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createRecordTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createRecordTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropRecordTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE record
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropRecordTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropRecordTable error: ${(e as string).toString()}` })
    return false
  }
}
