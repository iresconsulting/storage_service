import express, { Router, Request, Response } from 'express'
import appRoot from 'app-root-path'
import fs from 'fs/promises'
import { HttpRes } from './utils/http'
import Record from '../models/pg/controllers/record'
import UserRole from '../models/pg/controllers/user_role'
import SystemConfig from '../models/pg/controllers/system_config'
import Member from '../models/pg/controllers/member'
import { createMemberTable, dropMemberTable } from '../models/pg/models/member'
import { createUserRoleTable, dropUserRoleTable } from '../models/pg/models/user_role'
import { createSystemConfigTable, dropSystemConfigTable } from '../models/pg/models/system_config'
import { createRecordTable, dropRecordTable } from '../models/pg/models/record'
import { gdrive } from '../utils/gcp'
import Uploader from '../utils/multer'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import { pgArrToArr } from '../models/pg/utils/helpers'

const router: Router = express.Router()

router.get('/health', (req, res) => {
  HttpRes.send200(res)
  return
})

router.get('/db/init', async (req, res) => {
  try {
    console.log('---tx start---');
    // drop
    await dropMemberTable()
    await dropUserRoleTable()
    await dropSystemConfigTable()
    await dropRecordTable()
    // create
    await Promise.all([
      createMemberTable(),
      createUserRoleTable(),
      createSystemConfigTable(),
      createRecordTable()
    ])
    await SystemConfig.create('root', '1234qwer')
    console.log('---tx end---');
    return HttpRes.send200(res)
  } catch(e) {
    return HttpRes.send500(res, String(e))
  }
})

router.get('/version', async (req: Request, res: Response) => {
  const _package = await fs.readFile(`${appRoot}/package.json`, 'utf-8')
  const jsonPackage = JSON.parse(_package)
  HttpRes.send200(res, null, { version: jsonPackage.version })
  return
})

// get records
router.get('/records', async (req, res) => {
 try {
  const { name } = req.query
  
  const _name = name ? String(name) : ''
  const list = await Record.getAll(_name)
  return HttpRes.send200(res, 'success', list)
 } catch {
  return HttpRes.send500(res)
 }
})

// create, update records
router.post('/records', Uploader.instance.fields([{ name: 'file', maxCount: 1 }]), async (req: any, res) => {
  try {
    // console.log(req.files);
    if (!req.files) {
      return HttpRes.send400(res)
    }
    const _file = req.files.file[0]
    // const _newFileName = _file.filename
    const mimetype = _file.mimetype
    const path = _file.path

    const { id, name, roles, tags } = req.body
    
    const uploaded = await gdrive.uploadFile({
      name,
      fields: 'id',
      mimeType: mimetype,
      path,
    })
    const fileId = uploaded.data.id
    if (id) {
      const update = await Record.update(id, name, fileId, roles, tags)
      return HttpRes.send200(res, 'success', update)
    } else {
      const insert = await Record.create(name, fileId, roles, tags)
      return HttpRes.send200(res, 'success', insert)
    }
   } catch(e) {
    // console.log(String(e));
    return HttpRes.send500(res)
   }
})

router.post('/records/download', async (req, res) => {
  try {
    const { file_id } = req.body
    const file = await gdrive.downloadFile(file_id)
    // console.log(file);
    return HttpRes.send200(res, 'success', { file })
  } catch(e) {
    // console.log(String(e));
    return HttpRes.send500(res)
   }
})

// get roles
router.get('/roles', async (req, res) => {
  try {
    const list = await UserRole.getAll()
    return HttpRes.send200(res, 'success', list)
   } catch {
    return HttpRes.send500(res)
   }
})

// create, update roles
router.post('/roles', async (req, res) => {
  try {
    const { id, name } = req.body
    if (id) {
      const update = await UserRole.update({ id, name })
      return HttpRes.send200(res, 'success', update)
    } else {
      const insert = await UserRole.create(name)
      return HttpRes.send200(res, 'success', insert)
    }
   } catch {
    return HttpRes.send500(res)
   }
})

// get member
router.get('/member', async (req, res) => {
  try {
    const list = await Member.getAll({ ...req.query })
    return HttpRes.send200(res, 'success', list)
   } catch {
    return HttpRes.send500(res)
   }
})

// ban & unban member
router.post('/member/auth', async (req, res) => {
  try {
    const { id, account_status } = req.body
    if (id) {
      const update = await Member.updateAccountStatus({ id, account_status })
      if (update) {
        return HttpRes.send200(res, 'success')
      }
      return HttpRes.send500(res)
    } else {
      throw HttpRes.send400(res)
    }
   } catch {
    return HttpRes.send500(res)
   }
})

// create, update member
router.post('/member', async (req, res) => {
  try {
    const { id, name, password, roles } = req.body
    if (id) {
      const update = await Member.update({ id, name, password, roles })
      return HttpRes.send200(res, 'success', update)
    } else {
      const list = await Member.getAll()
      const no = moment().format('YYYYMMDDHHmmss') + (list ? list.length : '0')
      const insert = await Member.create({ no, name, password, roles })
      return HttpRes.send200(res, 'success', insert)
    }
   } catch {
    return HttpRes.send500(res)
   }
})

// get system config
router.get('/config', async (req, res) => {
  try {
    const list = await SystemConfig.getAll()
    return HttpRes.send200(res, 'success', list)
   } catch {
    return HttpRes.send500(res)
   }
})

// update system
router.post('/config', async (req, res) => {
  try {
    const { id, root_usr, root_pwd } = req.body
    if (id) {
      const update = await SystemConfig.update(id, root_usr, root_pwd)
      return HttpRes.send200(res, 'success', update)
    } else {
      const insert = await SystemConfig.create(root_usr, root_pwd)
      return HttpRes.send200(res, 'success', insert)
    }
   } catch {
    return HttpRes.send500(res)
   }
})

const TOKEN_KEY = 'ires'

// login
router.post('/login', async (req, res) => {
  try {
    const { usr, pwd } = req.body
    const admin = req.headers['admin'] || 'false'    
    if (admin && admin === 'true') {
      const getConfig = await SystemConfig.getAll()
      if (getConfig && getConfig.length) {
        const config = getConfig[0]
        if (config.root_usr === usr && config.root_pwd === pwd) {
          const token = jwt.sign(
            { id: '-1', name: usr, no: '超級管理員', roles: [] },
            TOKEN_KEY,
            {
              expiresIn: "7d",
            }
          );
          return HttpRes.send200(res, 'success', { is_admin: true, token })
        }
      }
      return HttpRes.send400(res)
    } else {
      const getUser = await Member.getByNoAndPwd(usr, pwd)      
      if (getUser && getUser.length) {
        const user = getUser[0]
        const token = jwt.sign(
          { id: user.id, name: user.name, no: user.no, roles: pgArrToArr(user.roles) },
          TOKEN_KEY,
          {
            expiresIn: "7d",
          }
        );
        return HttpRes.send200(res, 'success', { ...user, roles: pgArrToArr(user.roles), token })
      }
    }
    return HttpRes.send400(res)
   } catch(e) {
    return HttpRes.send500(res, String(e))
   }
})

router.get('/verification', async (req, res) => {
  try {
    const authorization = req.headers['authorization'] || ''
    const split = authorization?.split('Bearer ')
    const admin = req.headers['admin'] || 'false'
    if (split?.length === 2) {
      const token = split[1]
      const decoded = jwt.verify(token, TOKEN_KEY);
      return HttpRes.send200(res, 'success', { ...decoded as object, is_admin: admin !== 'false' })
    }
    return HttpRes.send400(res)
  } catch(e) {
    return HttpRes.send500(res, String(e))
  }
})

export default router
