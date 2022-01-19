import { Client, QueryResult } from 'pg'
import Logger from '~/src/utils/logger'

const env = process.env
const connectionString: string = env.PG_URI || ''

export let client: Client

export default async function initPg(): Promise<void> {
  try {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'attempting to connect...' })
    client = new Client({
      connectionString,
    })
    await client.connect()
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'connected.' })
    await client.query('SELECT NOW()', (err: Error, res: QueryResult<any>) => {
      if (err) {
        console.log('[DB] Error: ' + err)
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

export async function terminate(): Promise<void> {
  await client.end()
}

