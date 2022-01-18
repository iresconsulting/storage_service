import axios from "axios";
import Logger from "../utils/logger";

export async function crypto_crawler_run_crawlers() {
  try {
    await axios.get(`${process.env.API_CRYPTO_CRAWLER_URL}/jobs/crawlers`)
    Logger.generateTimeLog({
      label: Logger.Labels.HTTP,
      message: `crypto_crawler_run_crawlers start.`
    })
  } catch (e: unknown) {
    const _errSerialized = (e as string).toString()
    Logger.generateTimeLog({
      label: Logger.Labels.HTTP,
      message: `crypto_crawler_run_crawlers error: ${_errSerialized}`
    })
  } finally {
    Logger.generateTimeLog({
      label: Logger.Labels.HTTP,
      message: `crypto_crawler_run_crawlers end.`
    })
    return
  }
}

export async function crypto_crawler_gc() {
  try {
    await axios.get(`${process.env.API_CRYPTO_CRAWLER_URL}/jobs/crawlers/gc`)
    Logger.generateTimeLog({
      label: Logger.Labels.HTTP,
      message: `crypto_crawler_gc start.`
    })
  } catch (e: unknown) {
    const _errSerialized = (e as string).toString()
    Logger.generateTimeLog({
      label: Logger.Labels.HTTP,
      message: `crypto_crawler_gc error: ${_errSerialized}`
    })
  } finally {
    Logger.generateTimeLog({
      label: Logger.Labels.HTTP,
      message: `crypto_crawler_gc end.`
    })
    return
  }
}
