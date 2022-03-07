import { AppAccessLevel } from './../../models/pg/models/access_level'

export function isValidAdminAccessLevel(val: string) {
  return val === AppAccessLevel.admin1 ||
    val === AppAccessLevel.admin2 ||
    val === AppAccessLevel.admin3 ||
    val === AppAccessLevel.root
}
