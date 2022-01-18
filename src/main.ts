import { crypto_crawler_gc, crypto_crawler_run_crawlers } from "./controllers"
import Logger from "./utils/logger"
import Scheduler from "./utils/scheduler"

export default async function main() {
  try {
    new Scheduler('* * * * *', crypto_crawler_run_crawlers, null, { invokeOnInitialization: true })
    new Scheduler('0 */24 * * *', crypto_crawler_gc, null, { invokeOnInitialization: true })
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.JOB, message: `main error: ${(e as string).toString()}` })
    main()
  }
}
