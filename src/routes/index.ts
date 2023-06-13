import express, { Router, Request, Response } from 'express'
import appRoot from 'app-root-path'
import fs from 'fs'
import { HttpRes } from './utils/http'
import Record from '../models/pg/controllers/record'
import UserRole from '../models/pg/controllers/user_role'
import SystemConfig from '../models/pg/controllers/system_config'
import Member from '../models/pg/controllers/member'

const router: Router = express.Router()

router.get('/health', (req, res) => {
  HttpRes.send200(res)
  return
})

router.get('/version', async (req: Request, res: Response) => {
  const _package = await fs.readFileSync(`${appRoot}/package.json`, 'utf-8')
  const jsonPackage = JSON.parse(_package)
  HttpRes.send200(res, null, { version: jsonPackage.version })
  return
})

// get records
router.get('/records', async (req, res) => {
 try {
  const list = await Record.getAll()
  return HttpRes.send200(res, 'success', list)
 } catch {
  return HttpRes.send500(res)
 }
})

// create, update records
router.post('/records', async (req, res) => {
  try {
    const { id, name, path, roles } = req.body
    if (id) {
      const update = await Record.update(id, name, path, roles)
      return HttpRes.send200(res, 'success', update)
    } else {
      const insert = await Record.create(name, path, roles)
      return HttpRes.send200(res, 'success', insert)
    }
   } catch {
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
    const list = await Member.getAll()
    return HttpRes.send200(res, 'success', list)
   } catch {
    return HttpRes.send500(res)
   }
})

// create, update member
router.post('/member', async (req, res) => {
  try {
    const { id, no, name, password, roles } = req.body
    if (id) {
      const update = await Member.update({ id, no, name, password, roles })
      return HttpRes.send200(res, 'success', update)
    } else {
      const insert = await Member.create({ no, name, password, roles })
      return HttpRes.send200(res, 'success', insert)
    }
   } catch {
    return HttpRes.send500(res)
   }
})

// ban & unban people
router.post('/people/auth', async (req, res) => {
  try {
    const { id, account_status } = req.body
    if (id) {
      const update = await Member.updateAccountStatus({ id, account_status })
      return HttpRes.send200(res)
    } else {
      throw HttpRes.send400(res)
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

// login
router.post('/login', (req, res) => {
  try {
    const data = {
      token: '123456890',
    }
    return HttpRes.send200(res, 'success', data)
   } catch {
    return HttpRes.send500(res)
   }
})

export default router
