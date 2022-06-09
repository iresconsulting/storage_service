import { AppAccessLevel } from './../models/access_level'
import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'

namespace MemberAddress {
  export async function create({
    address_line_one,
    address_line_two = '',
    address_line_three = '',
    postal_code,
    city,
    district = '',
    member_id
  }: {
    address_line_one: string,
    address_line_two: string,
    address_line_three: string,
    postal_code: string,
    city: string,
    district: string,
    member_id: string
  }): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO member_address(address_line_one, address_line_two, address_line_three, postal_code, city, district, member_id)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        address_line_one,
        address_line_two,
        address_line_three,
        postal_code,
        city,
        district,
        member_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `create Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function update({
    address_line_one,
    address_line_two = '',
    address_line_three = '',
    postal_code,
    city,
    district = '',
    member_id
  }: {
    address_line_one: string,
    address_line_two: string,
    address_line_three: string,
    postal_code: string,
    city: string,
    district: string,
    member_id: string
  }): Promise<Array<any> | false> {
    const sql = `
      UPDARE member_address(address_line_one, address_line_two, address_line_three, postal_code, city, district)
      SET address_line_one = $1, address_line_two = $2, address_line_three = $3, postal_code = $4, city = $5, district = $6
      WHERE member_id = $7
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        address_line_one,
        address_line_two,
        address_line_three,
        postal_code,
        city,
        district,
        member_id
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
      FROM member_address
      WHERE member_address.member_id = $1
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

export default MemberAddress
