import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createAdminWhitelistTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS admin_whitelist (
      id bigserial PRIMARY KEY,
      email text DEFAULT '0',
      access_level text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_access_level
        FOREIGN KEY(access_level)
          REFERENCES access_level(id)
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createAdminWhitelistTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createAdminWhitelistTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropAdminWhitelistTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE admin_whitelist
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropAdminWhitelistTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropAdminWhitelistTable error: ${(e as string).toString()}` })
    return false
  }
}
