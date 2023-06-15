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
      VALUES($1, $2, $3, $4, $5)
      RETURNING *
    `

    try {
      const find = await getByNo(no)
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
  export async function getAll(payload?: any): Promise<Array<any> | false> {
    let sql = `
      SELECT id, no, name, roles, access_token, refresh_token, account_status, last_login, created_at, last_updated
      FROM member
      ORDER BY last_updated DESC
    `

    if (payload?.no && payload?.roles) {
      sql = `
        SELECT id, no, name, roles, access_token, refresh_token, account_status, last_login, created_at, last_updated
        FROM member
        WHERE no = $1
        AND roles LIKE $2
        ORDER BY last_updated DESC
      `
    } else if (payload?.no) {
      sql = `
        SELECT id, no, name, roles, access_token, refresh_token, account_status, last_login, created_at, last_updated
        FROM member
        WHERE no = $1
        ORDER BY last_updated DESC
      `
    } else if (payload?.roles) {
      sql = `
        SELECT id, no, name, roles, access_token, refresh_token, account_status, last_login, created_at, last_updated
        FROM member
        WHERE roles LIKE $1
        ORDER BY last_updated DESC
      `
    }

    const _payload: any[] = []

    if (payload?.no && payload?.roles) {
      _payload.push(payload?.no, `%${payload?.roles}%`)
    } else if (payload?.no) {
      _payload.push(payload?.no)
    } else if (payload?.roles) {
      _payload.push(`%${payload?.roles}%`)
    }

    try {
      const { rows } = await client.query(sql, _payload)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAll Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByNo(no: string): Promise<Array<any> | false> {
    const sql = `
      SELECT id, no, name, roles, access_token, refresh_token, account_status, last_login, created_at, last_updated
      FROM member
      WHERE no = $1
    `

    try {
      const { rows } = await client.query(sql, [no])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByUsername Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getPasswordByNo(no: string): Promise<Array<any> | false> {
    const sql = `
      SELECT password
      FROM member
      WHERE no = $1
    `

    try {
      const { rows } = await client.query(sql, [no])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getPasswordByUsername Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByNoAndPwd(no: string, pwdPlainText: string): Promise<Array<any> | false> {
    const getUser = await getPasswordByNo(no)    
    if (!getUser || !getUser.length) {
      return false
    }
    const user = getUser[0]
    if (!user?.password) {
      return false
    }
    const isPwdValid = await bcrypt.compare(pwdPlainText, user?.password)    
    if (isPwdValid) {
      const user = await getByNo(no)
      if (user && user.length) {
        return user
      }
      return false
    } else {
      return false
    }
  }

  export async function update({ id, name, password, roles }: any): Promise<Array<any> | false> {
    const sql = `
      UPDATE member
      SET name = $2, password = $3, roles = $4, last_updated = $5
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, name, password, roles, genDateNowWithoutLocalOffset()])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateAccountStatus({ id, account_status }: any): Promise<Array<any> | false> {
    const sql = `
      UPDATE member
      SET account_status = $2
      WHERE id = $1
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [id, account_status])
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
