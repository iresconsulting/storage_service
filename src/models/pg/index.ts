import { Client, QueryResult } from 'pg'
import Logger from '~/src/utils/logger'
import Member from './controllers/member'
import Transaction from './controllers/transaction'
import Wallet from './controllers/wallet'

const env = process.env
const connectionString: string = env.PG_URI || ''

export let client: Client

export namespace Pg {
  export async function terminate(): Promise<void> {
    await client.end()
  }

  export let instance: Client = client
}

export default async function initPg(): Promise<void> {
  try {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'attempting to connect...' })
    client = new Client({
      // connectionString,
      connectionString: 'postgres://dfxfxkbr:aRKgGYCYe8U9UxS3WhJFRjZzKpik_zle@satao.db.elephantsql.com/dfxfxkbr'
    })
    await client.connect()
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'connected.' })
    await client.query('SELECT NOW()', (err: Error, res: QueryResult<any>) => {
      if (err) {
        Logger.generateTimeLog({ label: Logger.Labels.PG, message: `connection error: ${String(err)}` })
        return
      }
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `SELECT NOW(): ${JSON.stringify(res.rows)}` })
    })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `connection error: ${(e as string).toString()}` })
    const _timeout = setTimeout(async () => {
      await initPg()
      clearTimeout(_timeout)
    }, 3000)
  }
}

export {
  Member,
  Wallet,
  Transaction
}
