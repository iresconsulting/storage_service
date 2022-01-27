import Logger from '~/src/utils/logger'
import initMongo from '~/src/models/mongo'
import initPg from '~/src/models/pg'
import Scheduler from '~/src/utils/scheduler'
// import Firebase from './utils/firebase'
import './utils/decimal_js'
import './utils/big_number'
// not required to initialize
// import './utils/firebase/admin'

async function db() {
  await Promise.allSettled([
    initPg(),
    initMongo()
  ])
}

async function utils() {
}

export default async function main() {
  Logger.generateTimeLog({ label: Logger.Labels.ENV, message: '-------main_start-------' })
  await db()
  Logger.generateTimeLog({ label: Logger.Labels.ENV, message: '-------main_end-------' })
}
