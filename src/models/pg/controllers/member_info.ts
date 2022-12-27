import { client } from '..'
import { querySuccessHandler } from './utils'
import Logger from '~/src/utils/logger'

namespace MemberInfo {
  export async function create({
    name = '',
    birthday = '',
    origin = '',
    member_id,
    about = ''
  }: {
    name: string,
    birthday: string,
    origin: string,
    member_id: string,
    about: string
  }): Promise<Array<any> | false> {
    const sql = `
      INSERT INTO member_info(name, birthday, origin, about, member_id)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        name,
        birthday,
        origin,
        about,
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
    birthday = '',
    origin = '',
    member_id,
    about = ''
  }: {
    name: string,
    birthday: string,
    origin: string,
    member_id: string,
    about: string
  }): Promise<Array<any> | false> {
    const sql = `
      UPDATE member_info
      SET name = $1, birthday = $2, origin = $3, about = $4
      WHERE member_id = $5
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        name,
        birthday,
        origin,
        about,
        member_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `update Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateAvatar({
    avatar,
    member_id,
  }: {
    avatar: string,
    member_id: string,
  }): Promise<Array<any> | false> {
    const sql = `
      UPDATE member_info
      SET avatar = $1
      WHERE member_id = $2
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        avatar,
        member_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateAvatar Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateCategory({
    category,
    member_id,
  }: {
    category: string,
    member_id: string,
  }): Promise<Array<any> | false> {
    const sql = `
      UPDATE member_info
      SET category = $1
      WHERE member_id = $2
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        category,
        member_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateCategory Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getById(member_id: string): Promise<Array<any> | false> {
    const fn = `
    create or replace function cast_to_int(text, integer) returns integer as $$
    begin
        return cast($1 as integer);
    exception
        when invalid_text_representation then
            return $2;
    end;
    $$ language plpgsql immutable;
    `
    await client.query(fn);
    const sql = `
      SELECT
        member_info.avatar as avatar,
        member_info.category as category,
        member_info.name as name,
        member_info.origin as origin,
        member_info.about as about,
        member_info.member_id as member_id,
        member_info.is_main as is_main,
        member_info.is_featured as is_featured,
        member_info.tag as tag,
        m2.tag as gallery_tag,
        m2.name as gallery_name,
        m2.member_id as gallery_id,
        m2.avatar as gallery_avatar
      FROM member_info
      LEFT JOIN member
      ON member_info.member_id = member.id
      LEFT JOIN member_info m2
      on cast_to_int(member.description, -1) = m2.member_id
      WHERE member_info.member_id = $1
      `

    try {
      const { rows } = await client.query(sql, [member_id])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getById Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getAll(): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member.id as id,
        member.allowed_login_status as allowed_login_status,
        member.description as description,
        member.email as email,
        member.username as username,
        member.access_level as access_level,
        member_info.about as about,
        member_info.avatar as avatar,
        member_info.category as category,
        member_info.name as name,
        member_info.origin as origin,
        member_info.is_main as is_main,
        member_info.is_featured as is_featured,
        member_info.tag as tag
      FROM member_info
      LEFT JOIN member
      ON member_info.member_id = member.id
      ORDER BY name
      ASC
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getAll Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getMain(): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member.id as id,
        member.allowed_login_status as allowed_login_status,
        member.description as description,
        member.email as email,
        member.username as username,
        member_info.about as about,
        member_info.avatar as avatar,
        member_info.category as category,
        member_info.name as name,
        member_info.origin as origin,
        member_info.is_main as is_main,
        member_info.is_featured as is_featured
      FROM member_info
      LEFT JOIN member
      ON member_info.member_id = member.id
      WHERE is_main = true AND allowed_login_status = true
      ORDER BY name
      ASC
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getMain Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getFeatured(): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member.id as id,
        member.allowed_login_status as allowed_login_status,
        member.description as description,
        member.email as email,
        member.username as username,
        member_info.about as about,
        member_info.avatar as avatar,
        member_info.category as category,
        member_info.name as name,
        member_info.origin as origin,
        member_info.is_main as is_main,
        member_info.is_featured as is_featured
      FROM member_info
      LEFT JOIN member
      ON member_info.member_id = member.id
      WHERE is_featured = true AND allowed_login_status = true
      ORDER BY name
      ASC
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getFeatured Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getFeaturedGalleries(): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member.id as id,
        member.allowed_login_status as allowed_login_status,
        member.description as description,
        member.email as email,
        member.username as username,
        member_info.about as about,
        member_info.avatar as avatar,
        member_info.category as category,
        member_info.name as name,
        member_info.origin as origin,
        member_info.is_main as is_main,
        member_info.is_featured as is_featured,
        member_info.tag as tag
      FROM member_info
      LEFT JOIN member
      ON member_info.member_id = member.id
      WHERE is_featured = true AND allowed_login_status = true AND access_level = '4'
      ORDER BY name
      ASC
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getFeaturedGalleries Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function getMainGalleries(): Promise<Array<any> | false> {
    const sql = `
      SELECT
        member.id as id,
        member.allowed_login_status as allowed_login_status,
        member.description as description,
        member.email as email,
        member.username as username,
        member_info.about as about,
        member_info.avatar as avatar,
        member_info.category as category,
        member_info.name as name,
        member_info.origin as origin,
        member_info.is_main as is_main,
        member_info.is_featured as is_featured,
        member_info.tag as tag
      FROM member_info
      LEFT JOIN member
      ON member_info.member_id = member.id
      WHERE is_main = true AND allowed_login_status = true AND member.access_level = '4'
      ORDER BY name
      ASC
    `

    try {
      const { rows } = await client.query(sql)
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `getMainGalleries Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateMain({
    value,
    member_id,
  }: {
    value: boolean,
    member_id: string,
  }): Promise<Array<any> | false> {
    const sql = `
      UPDATE member_info
      SET is_main = $1
      WHERE member_id = $2
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        value,
        member_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateMain Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateFeatured({
    value,
    member_id,
  }: {
    value: boolean,
    member_id: string,
  }): Promise<Array<any> | false> {
    const sql = `
      UPDATE member_info
      SET is_featured = $1
      WHERE member_id = $2
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        value,
        member_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateFeatured Error ${(e as string).toString()}` })
      return false
    }
  }

  export async function updateTag({
    value,
    member_id,
  }: {
    value: string,
    member_id: string,
  }): Promise<Array<any> | false> {
    const sql = `
      UPDATE member_info
      SET tag = $1
      WHERE member_id = $2
      RETURNING *
    `

    try {
      const { rows } = await client.query(sql, [
        value,
        member_id
      ])
      return querySuccessHandler(rows)
    } catch (e: unknown) {
      Logger.generateTimeLog({ label: Logger.Labels.PG, message: `updateTag Error ${(e as string).toString()}` })
      return false
    }
  }
}

export default MemberInfo
