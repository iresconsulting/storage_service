import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createFolderTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS folder (
    	id bigserial PRIMARY KEY,
      name text DEFAULT '',
    	parent_name text DEFAULT '',
      parent_id text DEFAULT null,
      password text DEFAULT '',
      hidden boolean DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createFolderTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createFolderTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropFolderTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE folder
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropFolderTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropFolderTable error: ${(e as string).toString()}` })
    return false
  }
}
