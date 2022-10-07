import { client } from '..'
import { BCRYPT_SALT_ROUNDS } from '../utils/constants'
import bcrypt from 'bcrypt'
import { isRowsExist, genDateNowWithoutLocalOffset } from '../utils/helpers'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'
import Wallet from './wallet'

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
    phoneNumber?: string,
    allowed_login_status?: boolean
  ): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO member(email, password, access_token, refresh_token, provider, access_level, description, username, phone_number, allowed_login_status)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
        _phoneNumber,
        !!allowed_login_status
      ])

      await Wallet.create(rows[0].id)

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

  export async function getByGalleryId(id: string): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member.id as id,
        member_info.name as name,
        member_info.avatar as avatar,
        member_info.origin as origin,
        member_info.about as about,
        member.email as email,
        member.username as username,
        member.credit_level as credit_level,
        member.created_at as created_at,
        member.description as description,
        member.allowed_login_status as allowed_login_status
      FROM member
      LEFT JOIN member_info
      ON member_info.member_id = member.id
      WHERE member.description = $1
    `

    try {
      const { rows } = await client.query(sql, [id])
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

  export async function getByAccessLevelAndWalletInfo(accessLevelRange: string[]): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member.id as id,
        member.email as email,
        member.last_login as last_login,
        member.created_at as created_at,
        member.allowed_login_status as allowed_login_status,
        wallet.balance_total as balance_total,
        member.provider as wallet_address,
        wallet.id as wallet_id,
        member.credit_level as credit_level
      FROM wallet
      LEFT JOIN member
      ON member.id = wallet.user_id
      WHERE access_level >= $1 AND access_level <= $2
    `

    const sql2 = `
      SELECT amount, member_id
      FROM transaction
    `

    try {
      const { rows } = await client.query(sql, [Number(accessLevelRange[0]), Number(accessLevelRange[1])])

      const { rows: rows2 } = await client.query(sql2)
      const _rows = rows.map((row) => {
        return {
          ...row,
          cumulative_earnings: rows2
            .filter((row2) => row2.member_id === row.id)
            .reduce((acc, curr) => {
              if (curr.direction) {
                acc += Number(curr.amount)
              } else {
                acc -= Number(curr.amount)
              }
              return acc
            }, 0) || 0
        }
      })
      return querySuccessHandler(_rows)

    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByAccessLevelAndWalletInfo Error ${(e as string).toString()}` })
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
    access_level = 'access_level',
    provider = 'provider'
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
        access_level: 'access_level',
        provider: 'provider'
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

  export async function getByIdWithAddressInfo(id: string): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member.id as id,
        member_address.address_line_one as address_line_one,
        member_address.address_line_two as address_line_two,
        member_address.address_line_three as address_line_three,
        member_address.postal_code as postal_code,
        member_address.city as city,
        member_address.district as district,
        member.phone_number as phone_number,
        member.access_level as access_level,
        member.otp_mode as otp_mode,
        member.identity_verified as identity_verified,
        member.identification_gov_issued_number as identification_gov_issued_number,
        member.identification_driver_licence_number as identification_driver_licence_number,
        member.identification_health_insurance_number as identification_health_insurance_number,
        member.carrier_number as carrier_number,
        member.allowed_login_status as allowed_login_status,
        member.last_login as last_login,
        member.created_at as created_at
      FROM member
      LEFT JOIN member_address
      ON member.id = member_address.member_id
      WHERE member.id = $1
    `

    try {
      const { rows } = await client.query(sql, [id])
      return querySuccessHandler(rows)

    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByIdWithAddressInfo Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updatePlan(id: string, plan: string): Promise<Array<any> | false> {
    const sql = `
      UPDATE member
      SET credit_level = $2
      WHERE id = $1
    `

    try {
      const { rows } = await client.query(sql, [id, plan])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updatePlan Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getGalleryInfo(): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member_info.about as about,
        member.id as id,
        member.allowed_login_status as allowed_login_status,
        member_info.avatar as avatar,
        member_info.category as category,
        member.description as description,
        member.email as email,
        member_info.name as name,
        member_info.origin as origin,
        member_info.username as username
      FROM member
      LEFT JOIN member_info
      ON member_info.member_id = member.id
      WHERE access_level = '4'
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)

    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByAccessLevel Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getGalleryInfoById(id: string): Promise<Array<any> | false> {
    const sql = `
      SELECT *
      FROM member
      LEFT JOIN member_info
      ON member_info.member_id = member.id
      WHERE access_level = '4' AND member.id = $1
    `

    try {
      const { rows } = await client.query(sql, [id])
      return querySuccessHandler(rows)

    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getByAccessLevel Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default Member

