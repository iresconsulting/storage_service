import Logger from './utils/logger'
import initMongo from './models/mongo'
import initPg from './models/pg'
import Scheduler from './utils/scheduler'
// import Firebase from './utils/firebase'
import './utils/decimal_js'
import './utils/big_number'

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
