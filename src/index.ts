import express, { Application, Response, Request } from 'express'
import cookieParser from 'cookie-parser'

import indexRouter from './routes/index'
import Logger from './utils/logger'
import main from './main'

const base = '/'
const port = 9000

/* initalize express start */
const app: Application = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(base, indexRouter)

// 403 all other routes
app.use('*', function (req: Request, res: Response, next: Function): void {
  res.send({ code: 403, message: 'forbidden' })
  return
})

app.listen(port, () => {
  Logger.generateTimeLog({ label: Logger.Labels.HTTP, message: `Listening on ${base}:${port}` })
})
/* initalize express end */

Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `ENV_GLOBAL=${process.env.ENV_GLOBAL}` })
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `USE_PROXY=${process.env.USE_PROXY}` })
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `CORS_URL=${process.env.CORS_URL}` })
console.log()
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `PG_URI=${process.env.PG_URI}` })
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `MONGO_URI=${process.env.MONGO_URI}` })

/* initalize main start */
main()
/* initalize main end */
