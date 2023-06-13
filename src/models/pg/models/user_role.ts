import Logger from '~/src/utils/logger'
import { client } from '..'

export async function createUserRoleTable(): Promise<void | false> {
  const sql: string = `
    CREATE TABLE IF NOT EXISTS user_role (
      id text PRIMARY KEY,
      name text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'createUserRoleTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `createUserRoleTable error: ${(e as string).toString()}` })
    return false
  }
}

export async function dropUserRoleTable(): Promise<void | false> {
  const sql: string = `
    DROP TABLE user_role
  `

  try {
    await client.query(sql)
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: 'dropUserRoleTable success.' })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.PG, message: `dropUserRoleTable error: ${(e as string).toString()}` })
    return false
  }
}

// export async function defineUserRole(): Promise<void | false> {
//   const sql: string = `
//     INSERT INTO access_level(id, description)
//     VALUES($1, $2)
//     RETURNING *
//   `

//   const accessLevel: { id: string, name: string }[] = [
//     { id: AppAccessLevel.guest, name: 'guest' },
//     { id: AppAccessLevel.user, name: 'user' },
//     { id: AppAccessLevel.admin1, name: 'admin_1' },
//     { id: AppAccessLevel.admin2, name: 'admin_2' },
//     { id: AppAccessLevel.admin3, name: 'admin_3' },
//     { id: AppAccessLevel.root, name: 'root' }
//   ]

//   try {
//     let res = []
//     for await (let item of accessLevel) {
//       const { id, name } = item
//       const { rows } = await client.query(sql, [id, name])
//       if (isRowsExist(rows) && rows) {
//         res.push(rows[0])
//       }
//     }
//     Logger.generateTimeLog({ label: Logger.Labels.PG, message: `defineUserRole success. ${res}` })
//   } catch (e: unknown) {
//     Logger.generateTimeLog({ label: Logger.Labels.PG, message: `defineUserRole error: ${(e as string).toString()}` })
//     return false
//   }
// }
