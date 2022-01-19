import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createMemberTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS member (
      id bigserial PRIMARY KEY,
      provider text NOT NULL,
      username text DEFAULT '0',
      email text DEFAULT '0',
      password text DEFAULT '0',
      phone_number text DEFAULT '000000000',
      credit_level text DEFAULT '0',
      access_level text NOT NULL,
      description text DEFAULT '0',
      access_token text NOT NULL,
      refresh_token text NOT NULL,
      otp_mode boolean DEFAULT false,
      identity_verified boolean DEFAULT false,
      identification_gov_issued_number text DEFAULT 'A000000000',
      identification_driver_licence_number text DEFAULT 'A000000000',
      identification_health_insurance_number text DEFAULT '000000000000',
      carrier_number text DEFAULT '000000000000',
      allowed_login_status boolean default true,
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_access_level
        FOREIGN KEY(access_level)
          REFERENCES access_level(id)
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createMemberTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createMemberTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropMemberTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE member
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropMemberTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropMemberTable error: ${(e as string).toString()}` })
    return false
  }
}
