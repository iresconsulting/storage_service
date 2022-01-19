import mongoose from 'mongoose'
import Logger from '~/src/utils/logger'

const env = process.env

const MONGO_CONNSTR = env.ENV !== 'production'
  ? `mongodb+srv://${env.MONGO_URI}?retryWrites=true&w=majority`
  : `${env.MONOGO_URI}`

export default async function initMongo() {
  try {
    Logger.generateTimeLog({ label: Logger.Labels.MONGO, message: 'attempting to connect...' })
    const connection = await mongoose.connect(MONGO_CONNSTR, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false
    })
    Logger.generateTimeLog({ label: Logger.Labels.MONGO, message: 'connected.' })
    return connection
  } catch (e: unknown) {
    Logger.generateTimeLog({ label: Logger.Labels.MONGO, message: `connection error: ${(e as string).toString()}` })
    const _timeout = setTimeout(async () => {
      await initMongo()
      clearTimeout(_timeout)
    }, 3000)
  }
}
