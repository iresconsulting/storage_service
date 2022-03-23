import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createMemberAddressTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS member_address (
      id bigserial PRIMARY KEY,
      member_id bigserial NOT NULL,
      address_line_one text DEFAULT '',
      address_line_two text DEFAULT '',
      address_line_three text DEFAULT '',
      postal_code text DEFAULT '',
      city text DEFAULT '',
      district text DEFAULT '',
      state text DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_member_id
        FOREIGN KEY(member_id)
          REFERENCES member(id)
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createMemberAddressTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createMemberAddressTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropMemberAddressTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE member_address
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropMemberAddressTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropMemberAddressTable error: ${(e as string).toString()}` })
    return false
  }
}
