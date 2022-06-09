import express, { Router, Request, Response } from 'express'
import appRoot from 'app-root-path'
import fs from 'fs'
import { HttpRes } from './utils/http'

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

export default router
