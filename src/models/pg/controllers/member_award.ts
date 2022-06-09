import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'

export type AwardType = 'expo' | 'award'

namespace MemberAward {
  export async function create({
    name = '',
    type,
    year = '',
    member_id
  }: {
    name: string,
    type: AwardType,
    year: string,
    member_id: string
  }): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO member_award(name, type, year, member_id)
      VALUES($1, $2, $3, $4)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        name,
        type,
        year,
        member_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function update({
    name = '',
    type,
    year = '',
    item_id,
  }: {
    name: string,
    type: AwardType,
    year: string,
    item_id: string
  }): Promise<Array<any> | false> {
    const sql = `
      UPDARE member_award(name, type, year)
      SET name = $1, type = $2, year = $3
      WHERE item_id = $4
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        name,
        type,
        year,
        item_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAllPagination(member_id: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member_award
      WHERE member_id = $1
    `

    try {
      const { rows } = await client.query(sql, [member_id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAllPagination Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default MemberAward
