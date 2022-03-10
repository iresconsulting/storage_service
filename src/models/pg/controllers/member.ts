import { client } from '..'
import { BCRYPT_SALT_ROUNDS } from '../utils/constants'
import bcrypt from 'bcrypt'
import { isRowsExist, genDateNowWithoutLocalOffset } from '../utils/helpers'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'

namespace Member {
  export async function create(
    accessToken: string,
    refreshToken: string,
    provider: 'local' | string,
    accessLevel: string,
    email?: string,
    password?: string,
    description?: string,
    username?: string,
    phoneNumber?: string
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO member(email, password, access_token, refresh_token, provider, access_level, description, username, phone_number)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    try {
      if (provider === 'local' && (!email || !password)) {
        throw new Error('Email and Password Input Invalid.')
      }

      if (provider === 'local' && email) {
        const find = await getByEmail(email)
        if (find !== false && find.length > 1) {
          throw new Error('Email Already Exist.')
        }
      }

      const emailMap = email ? email : ''
      const descriptionMap = description ? description : emailMap
      const usernameMap = username ? username : emailMap
      let _password = ''
      const _phoneNumber = phoneNumber ? phoneNumber : ''

      if (provider === 'local') {
        _password = await bcrypt.hash(password as string, BCRYPT_SALT_ROUNDS)
      } else {
        _password = ''
      }

      const { rows } = await client.query(sql, [
        emailMap,
        _password,
        accessToken,
        refreshToken,
        provider,
        accessLevel,
        descriptionMap,
        usernameMap,
        _phoneNumber
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  // TODO pagination logic
  export async function getAllPagination(): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      ORDER BY last_login DESC
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAllPagination Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getById(id: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      WHERE id = $1
    `

    try {
      const { rows } = await client.query(sql, [id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getById Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByAccessToken(token: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      WHERE access_token = $1
    `

    try {
      const { rows } = await client.query(sql, [token])
      return querySuccessHandler(rows)

    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByAccessToken Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByEmail(email: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      WHERE email = $1
    `

    try {
      const { rows } = await client.query(sql, [email])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByEmail Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getByAccessLevel(accessLevelRange: string[]): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      WHERE access_level >= $1 AND access_level <= $2
    `

    try {
      const { rows } = await client.query(sql, [Number(accessLevelRange[0]), Number(accessLevelRange[1])])
      return querySuccessHandler(rows)

    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByAccessLevel Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getAndVerifyByPassword(email: string, password: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      WHERE email = $1
    `

    try {
      const { rows } = await client.query(sql, [email])
      if (isRowsExist(rows)) {
        const comparePasswordResult: boolean = await bcrypt.compare(password, rows[0].password)
        if (comparePasswordResult === true) {
          return rows
        }
        return false
      } else {
        return false
      }
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAndVerifyByPassword Error ${(e as string).toString()}` })
      return false
    }
  }

  export enum UserFlagField {
    password = 'password',
    creditLevel = 'credit_level',
    access_token = 'access_token',
    allowed_login_status = 'allowed_login_status',
    carrier_number = 'carrier_number',
    last_login = 'last_login',
    identification_gov_issued_number = 'identification_gov_issued_number',
    identity_verified = 'identity_verified',
    otp_mode = 'otp_mode',
    access_level = 'access_level'
  }

  export async function updateByField(id: string, flag: UserFlagField, value: string | boolean): Promise<Array<any> | false> {
    let sql = ''
    try {
      let res: boolean | any[] = false

      // password has hash
      // if (flag === 'password') {
      //   sql = `
      //     UPDATE member
      //     SET password = $2, last_updated = $3
      //     WHERE id = $1
      //     RETURNING *
      //   `
      //   const hashedPassword: string = await bcrypt.hash(value as string, BCRYPT_SALT_ROUNDS)
      //   const { rows } = await client.query(sql, [id, hashedPassword, genDateNowWithoutLocalOffset()])
      //   res = rows
      // }

      const flagMap: { [index: string]: string } = {
        creditLevel: 'credit_level',
        access_token: 'access_token',
        allowed_login_status: 'allowed_login_status',
        carrier_number: 'carrier_number',
        last_login: 'last_login',
        identification_gov_issued_number: 'identification_gov_issued_number',
        identity_verified: 'identity_verified',
        otp_mode: 'otp_mode',
        access_level: 'access_level'
      }

      const flagCurrent = flagMap[flag]

      if (flagCurrent === undefined) {
        throw new Error('Flag Input Error')
      }

      sql = `
        UPDATE member
        SET ${flagCurrent} = $2, last_updated = $3
        WHERE id = $1
        RETURNING *
      `

      console.log('flagCurrent', flagCurrent);
      

      const { rows } = await client.query(sql, [id, value.toString(), genDateNowWithoutLocalOffset()])
      res = rows
      return querySuccessHandler(res)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateByField Error ${(e as string).toString()}` })
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

