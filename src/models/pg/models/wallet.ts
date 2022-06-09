import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createWalletTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS wallet (
      id bigserial PRIMARY KEY,
      user_id bigserial NOT NULL,
      description text DEFAULT '0',
      tag text DEFAULT '',
      gas_deduction_percentage decimal NOT NULL DEFAULT 0,
      balance_total decimal DEFAULT 0,
      referral_total decimal DEFAULT 0,
      bonus_total decimal DEFAULT 0,
      active_status boolean DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT non_negative_balance_total check (balance_total >= 0),
      CONSTRAINT non_negative_referral_total check (referral_total >= 0),
      CONSTRAINT non_negative_bonus_total check (bonus_total >= 0),
      CONSTRAINT non_negative_gas_deduction_percentage check (bonus_total >= 0),
      CONSTRAINT fk_user_id
        FOREIGN KEY(user_id)
          REFERENCES member(id)
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createWalletTable success.' })
    console.log('[DB] createWalletTable Success.')
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createWalletTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropWalletTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE wallet
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropWalletTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropWalletTable error: ${(e as string).toString()}` })
    return false
  }
}

