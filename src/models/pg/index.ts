import { Client, QueryResult } from 'pg'
import Logger from '~/src/utils/logger'

const env = process.env
const connectionString: string = env.PG_URI || 'postgres://jzralqcb:tsdiLXEW622A6yRd8BwsQt8cAEr-wMXC@satao.db.elephantsql.com/jzralqcb'

export let client: Client

export namespace Pg {
  export async function terminate(): Promise<void> {
    await client.end()
  }

  export let instance: Client = client
}

export default async function initPg(): Promise<void> {
  try {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'connecting...' })
    client = new Client({
      connectionString,
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
