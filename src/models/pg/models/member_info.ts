import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createMemberInfoTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS member_info (
      id bigserial PRIMARY KEY,
      member_id bigserial NOT NULL,
      name text DEFAULT '',
      origin text DEFAULT '',
      birthday text DEFAULT '',
      about text DEFAULT '',
      avatar text DEFAULT '',
      tag text DEFAULT '',
      category text DEFAULT '',
      is_main boolean DEFAULT false,
      is_featured boolean DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_member_id
        FOREIGN KEY(member_id)
          REFERENCES member(id)
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createMemberInfoTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createMemberInfoTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropMemberInfoTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE member_info
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropMemberInfoTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropMemberInfoTable error: ${(e as string).toString()}` })
    return false
  }
}


export async function addMemberInfoAvatar(): Promise<void | false> {
  const sql: string = `
    ALTER TABLE member_info
    ADD COLUMN avatar text DEFAULT ''
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'addMemberInfoAvatar success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `addMemberInfoAvatar error: ${(e as string).toString()}` })
    return false
  }
}

export async function addMemberInfoCategory(): Promise<void | false> {
  const sql: string = `
    ALTER TABLE member_info
    ADD COLUMN category text DEFAULT ''
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'addMemberInfoCategory success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `addMemberInfoCategory error: ${(e as string).toString()}` })
    return false
  }
}
