import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createMemberAwardTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS member_award (
      id bigserial PRIMARY KEY,
      member_id bigserial NOT NULL,
      name text DEFAULT '',
      type text DEFAULT '',
      year text DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_member_id
        FOREIGN KEY(member_id)
          REFERENCES member(id)
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createMemberAwardTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createMemberAwardTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropMemberAwardTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE member_award
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropMemberAwardTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropMemberAwardTable error: ${(e as string).toString()}` })
    return false
  }
}
