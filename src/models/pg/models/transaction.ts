import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createTransactionTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS transaction (
      id bigserial PRIMARY KEY,
      member_id bigserial DEFAULT '',
      wallet_id bigserial,
      amount text DEFAULT '0',
      gas text DEFAULT '0',
      direction boolean NOT NULL,
      tag text DEFAULT '',
      description text DEFAULT '0',
      status boolean DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_wallet_id
        FOREIGN KEY(wallet_id)
	        REFERENCES wallet(id)
      CONSTRAINT fk_member_id
        FOREIGN KEY(member_id)
          REFERENCES member(id)
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createTransactionTable success.' })
    console.log('[DB] createTransactionTable Success.')
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createTransactionTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropTransactionTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE transaction
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropTransactionTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropTransactionTable error: ${(e as string).toString()}` })
    return false
  }
}

