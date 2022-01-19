import Logger from "./utils/logger"
import initMongo from "./models/mongo"
import initPg from "./models/pg"
import Scheduler from "./utils/scheduler"
import Firebase from './utils/firebase'

async function db() {
  initPg()
  initMongo()
}

export default async function main() {
  // Logger.generateTimeLog({ label: Logger.Labels.ENV, message: '------- main start -------' })
  await db()
  // Logger.generateTimeLog({ label: Logger.Labels.ENV, message: '------- main end -------' })
}
