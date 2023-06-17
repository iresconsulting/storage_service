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
import axios, { AxiosError, AxiosResponse } from 'axios'
import Folder from '../models/pg/controllers/folder'
import { createFolderTable, dropFolderTable } from '../models/pg/models/folder'

const router: Router = express.Router()

const env = process.env

router.get('/health', (req, res) => {
  return HttpRes.send200(res)
})

router.get('/db/init', async (req, res) => {
  try {
    if (process.env.ALLOW_DB_INIT !== 'true') {
      return HttpRes.send401(res)
    }
    console.log('---tx start---');
    // drop
    // await dropMemberTable()
    // await dropUserRoleTable()
    // await dropSystemConfigTable()
    await dropRecordTable()
    await dropFolderTable()
    // create
    await Promise.all([
      // createMemberTable(),
      // createUserRoleTable(),
      // createSystemConfigTable(),
      createRecordTable(),
      createFolderTable(),
    ])
    // await SystemConfig.create('root', '1234qwer')
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

// get folders
router.get('/folders', async (req, res) => {
  try {
   const { name, id } = req.query
   
   const _name = name ? String(name) : undefined
   const _id = id ? String(id) : undefined
   const list = await Folder.getAll(_name, _id)
   return HttpRes.send200(res, 'success', list)
  } catch {
   return HttpRes.send500(res)
  }
 })

 // create, update folders
 router.post('/folders', async (req, res) => {
  try {
   const { name, id, parent_name, parent_id, hidden, password, action_type } = req.body
    
   if (action_type === 'delete' && id && hidden !== undefined) {
    const list = await Folder.hide(id, hidden)
    return HttpRes.send200(res, 'success', list)
   } else if (id) {
     const list = await Folder.update(id, name, parent_name || '', parent_id || null, password || '', hidden || false)
     return HttpRes.send200(res, 'success', list)
   } else {
    const list = await Folder.create(name, parent_name || '', parent_id || null, password || '', hidden || false)
    return HttpRes.send200(res, 'success', list)
   }
  } catch(e) {
   return HttpRes.send500(res, String(e))
  }
 })

// get records
router.get('/records', async (req, res) => {
 try {
  const { name, folder_id } = req.query
  
  const _name = name ? String(name) : undefined
  const _folder_id = folder_id ? String(folder_id) : undefined
  const list = await Record.getAll(_name, _folder_id)
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

    const { id, name, roles, tags, folder_id } = req.body
    
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
      const insert = await Record.create(name, fileId, roles, tags, folder_id)
      return HttpRes.send200(res, 'success', insert)
    }
   } catch(e) {
    return HttpRes.send500(res, String(e))
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
    if (!pwd || pwd === '') {
      return HttpRes.send400(res)
    }
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

const lineAuth = {
  hostname: 'https://api.line.me',
  endpoint: '/oauth2',
  version: '/v2.1',
  versionProfile: '/v2'
}

router.post('/login/line', async (req, res) => {
  const redirect_uri = req.body.redirect_uri || ''
  const code: string = req.body.code

  await axios
    .post(
      `${lineAuth.hostname}${lineAuth.endpoint}${lineAuth.version}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: env.LINE_CHANNEL_ID_LOGIN ?? '',
        client_secret: env.LINE_CHANNEL_SECRET_LOGIN ?? ''
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )
    .then((response: AxiosResponse) => {
      const { access_token, refresh_token } = response.data
      return HttpRes.send200(res, 'success', { access_token, refresh_token })
    })
    .catch((err: AxiosError) => {      
      return HttpRes.send500(res)
    })
})

router.post('/login/line/verification', async (req: Request, res: Response) => {
  const { access_token, refresh_token } = req.body
  await axios
    .get(`${lineAuth.hostname}${lineAuth.endpoint}${lineAuth.version}/verify/`, {
      params: { access_token }
    })
    .then(async () => {
      // get user profile
      const profile = await axios.get(`${lineAuth.hostname}${lineAuth.versionProfile}/profile`, {
        headers: { Authorization: `Bearer ${access_token}` }
      })
      return profile
    })
    .then(async (response: AxiosResponse) => {
      // login success
      const { displayName, userId, pictureUrl, statusMessage } = response.data
      const findUserResult = await Member.getByUsername(userId)
      if (findUserResult === false || findUserResult.length === 0) {
        const list = await Member.getAll()
        const no = moment().format('YYYYMMDDHHmmss') + (list ? list.length : '0')
        const insert = await Member.create({ no, name: displayName, username: userId, password: '', roles: '' })
        if (insert === false) {
          return HttpRes.send500(res)
        } else {
          const getNewUser = await Member.getByUsername(userId)
          if (getNewUser && getNewUser.length) {
            const user = getNewUser[0]
            const token = jwt.sign(
              { id: user.id, name: user.name, no: user.no, roles: pgArrToArr(user.roles) },
              TOKEN_KEY,
              {
                expiresIn: "7d",
              }
            );
            return HttpRes.send200(res, 'success', { ...user, token })
          }
          return HttpRes.send500(res)
        }
      } else {
        const user = findUserResult[0]
        const updateUserResult = await Member.update({ id: user?.id, name: displayName, password: user?.password, roles: user?.roles })
        if (!updateUserResult || updateUserResult.length === 0) {
          return HttpRes.send500(res)
        }
        const token = jwt.sign(
          { id: user.id, name: user.name, no: user.no, roles: pgArrToArr(user.roles) },
          TOKEN_KEY,
          {
            expiresIn: "7d",
          }
        );
        return HttpRes.send200(res, 'success', { ...user, token })
      }
    })
    .catch(async (err: AxiosError) => {
      if (err.response?.status !== 404) {
        // use refresh token to get new access token
        await axios
          .post(
            `${lineAuth.hostname}${lineAuth.endpoint}${lineAuth.version}/token`,
            new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: env.LINE_CHANNEL_ID_LOGIN ?? '',
              client_secret: env.LINE_CHANNEL_SECRET_LOGIN ?? '',
              refresh_token,
            })
          )
          .then(async (response: AxiosResponse) => {
            const { access_token, refresh_token } = response.data
            const profile = await axios.get(`${lineAuth.hostname}${lineAuth.versionProfile}/profile`, {
              headers: { Authorization: `Bearer ${access_token}` }
            })
            const { displayName, userId, pictureUrl, statusMessage } = profile.data
            const findUserResult = await Member.getByUsername(userId)
            if (!findUserResult || findUserResult.length === 0) {
              return HttpRes.send400(res)
            }
            const user = findUserResult[0]
            const token = jwt.sign(
              { id: user.id, name: user.name, no: user.no, roles: pgArrToArr(user.roles) },
              TOKEN_KEY,
              {
                expiresIn: "7d",
              }
            );
            return HttpRes.send200(res, 'success: token refreshed', { ...user, token, access_token, refresh_token })
          })
          .catch((e) => {
            // need new refresh token
            return HttpRes.send400(res, 'new token required', { access_token: '', refresh_token: '' })
          })
      } else {
        return HttpRes.send500(res)
      }
    })
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
