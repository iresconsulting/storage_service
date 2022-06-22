import { client } from ".."
import { isRowsExist } from "../utils/helpers"

export async function queryHandler(sql: string, params?: any[]) {
  try {
    let arr
    if (params && params.length > 0) {
      arr = [...params]
    }
    const { rows } = await client.query(sql, arr)
    return rows
  } catch (e: unknown) {
    console.log(String(e));
    throw new Error(`${(e as string).toString()}`)
  }
}

interface QuerySuccessHandlerOptions {
  falsyOnEmpty?: boolean
}

export function querySuccessHandler(rows: any[], options?: QuerySuccessHandlerOptions) {
  if (isRowsExist(rows) && rows) {
    if (options) {
      const { falsyOnEmpty } = options
      if (falsyOnEmpty && rows.length === 0) {
        return false
      }
    }
    return rows
  } else {
    throw new Error('query failed.')
  }
}
