import { client } from '..'
import { BCRYPT_SALT_ROUNDS } from '../utils/constants'
import bcrypt from 'bcrypt'
import { genDateNowWithoutLocalOffset } from '../utils/helpers'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'

namespace Member {
  export async function create(
    { no, name, username, password, roles }: any
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO member(no, name, username, password, roles)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `

    try {
      const find = await getByUsername(username)
      if (find !== false && find.length > 1) {
        throw new Error('username already exists')
      }

      const pwdEncrypted = await bcrypt.hash(password as string, BCRYPT_SALT_ROUNDS)

      const { rows } = await client.query(sql, [
        no, name, username, pwdEncrypted, roles
      ])

      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAll(): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      ORDER BY last_updated DESC
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAll Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByUsername(email: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      WHERE username = $1
    `

    try {
      const { rows } = await client.query(sql, [email])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByEmail Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function update({ id, no, name, password, roles }: any): Promise<Array<any> | false> {
    const sql = `
      UPDATE member
      SET no = $2, name = $3, password = $4, roles = $4, last_updated = $6
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, no, name, password, roles, genDateNowWithoutLocalOffset()])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateAccountStatus({ id, account_status }: any): Promise<Array<any> | false> {
    const sql = `
      UPDATE member
      SET account_status = $2, last_updated = $3
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, account_status, genDateNowWithoutLocalOffset()])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function deleteById(id: string): Promise<Array<any> | false> {
    const sql = `
      DELETE FROM member
      WHERE id = $1
    `

    try {
      const { rows } = await client.query(sql, [id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `deleteById Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default Member
