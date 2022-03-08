import express, { Application, Response, Request } from 'express'
import cookieParser from 'cookie-parser'

import Logger from './utils/logger'
import main from './main'

import indexRouter from './routes/index'
import adminRouter from './routes/admin'
import userRouter from './routes/user'
import transactionRouter from './routes/transaction'

const port = process.env.PORT || 9001

/* initalize express start */
const app: Application = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/admin', adminRouter)
app.use('/user', userRouter)
app.use('/transaction', transactionRouter)

export const __dirname_ = __dirname.replace('/dist', '') + '/src'
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `__dirname_=${__dirname_}` })

// publicly accessible folder
app.use('/public', express.static(__dirname_ + '/public'))

// 403 rest of the routes
app.use('*', function (req: Request, res: Response, next: Function): void {
  res.send({ code: 403, message: 'forbidden: [*/member]' })
  return
})

app.listen(port, () => {
  Logger.generateTimeLog({ label: Logger.Labels.HTTP, message: `Listening on :${port}` })
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
