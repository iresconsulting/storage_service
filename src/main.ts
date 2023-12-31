import Logger from '~/src/utils/logger'
import initPg from '~/src/models/pg'
// import initMongo from '~/src/models/mongo'
// import Scheduler from '~/src/utils/scheduler'
// import Firebase from './utils/firebase'
import './utils/decimal_js'
import './utils/big_number'
// not required to initialize
// import './utils/firebase/admin'

import { authorize } from './utils/gcp'
import Scheduler from './utils/scheduler'
import clearPublicDir from './tasks/clearPublic'
import initMysql from './models/mysql'

const dbType = process.env.DB_TYPE || 'pg'

async function db() {
  if (dbType === 'pg') {
    await initPg()
  } else if (dbType === 'mysql') {
    await initMysql()
  }
  await Promise.allSettled([
    // initMongo()
  ])
}

async function utils() {
}

export default async function main() {
  Logger.generateTimeLog({ label: Logger.Labels.ENV, message: '-------main_start-------' })
  // new Scheduler('0 1 * * *', clearPublicDir, null, { invokeOnInitialization: true })
  await db()
  // await authorize()
  Logger.generateTimeLog({ label: Logger.Labels.ENV, message: '-------main_end-------' })
}
