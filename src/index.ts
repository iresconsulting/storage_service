import express, { Application, Response, Request } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
// import formidable from 'express-formidable'
import Logger from './utils/logger'
import main from './main'
import * as path from 'path'

import indexRouter from './routes/index'
import { HttpRes } from './routes/utils/http'

const port = process.env.PORT || 9001

/* initalize express start */
const app: Application = express()

// app.use(formidable())
app.use(cors())
app.use(express.json({ limit: '500mb' }))
app.use(express.urlencoded({ extended: false, limit: '500mb' }))
app.use(express.limit('10mb'))
app.use(cookieParser())

app.use('/', indexRouter)

export const __dirname_ = __dirname.replace('/dist', '') + '/src'
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `__dirname_=${__dirname_}` })

// publicly accessible folder
app.use('/public', express.static(__dirname_ + '/public'))
app.use('/uploads', express.static(__dirname_ + '/uploads'))
app.use(express.static(path.join(__dirname, '..', 'public')))
app.use(express.static(path.join(__dirname, '..', 'uploads')))

// 403 rest of the routes
app.use('*', function (req: Request, res: Response, next: Function): void {
  HttpRes.send403(res)
  return
})

app.listen(port, () => {
  Logger.generateTimeLog({ label: Logger.Labels.HTTP, message: `Listening on :${port}` })
})
/* initalize express end */

Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `ENV_GLOBAL=${process.env.ENV_GLOBAL}` })
// Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `USE_PROXY=${process.env.USE_PROXY}` })
// Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `CORS_URL=${process.env.CORS_URL}` })
// console.log()
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `PG_URI=${process.env.PG_URI}` })
// Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `MONGO_URI=${process.env.MONGO_URI}` })

Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `DB_TYPE=${process.env.DB_TYPE}` })
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `DB_HOST=${process.env.DB_HOST}` })
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `DB_USER=${process.env.DB_USER}` })
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `DB_PASSWORD=${process.env.DB_PASSWORD}` })
Logger.generateTimeLog({ label: Logger.Labels.ENV, message: `DB_DATABASE=${process.env.DB_DATABASE}` })

/* initalize main start */
main()
/* initalize main end */
