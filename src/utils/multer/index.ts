import { Request } from 'express'
import moment from 'moment'
import multer from 'multer'
import { v4 as uuid } from 'uuid'
import { __dirname_ } from '~/src'

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // path is absolute
    cb(null, __dirname_ + '/uploads/')
  },
  filename(req, file, cb) {
    cb(null, moment().format('YYYYMMDD_HHmmss_') + file.originalname)
  }
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  switch (file.mimetype) {
    // images only, or add new types
    case 'image/jpeg':
    case 'image/png': {
      cb(null, true)
      return
    }
    default:
      cb(null, true)
  }
}

namespace Uploader {
  export const instance = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter
  })
}

export default Uploader
