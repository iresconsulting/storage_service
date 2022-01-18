import express, { Router, Request, Response } from 'express'
import appRoot from 'app-root-path'
import fs from 'fs'

const router: Router = express.Router()

router.get('/health', (req, res) => {
  res.send({ code: 200, data: {}, msg: 'OK' })
})

router.get('/version', async (req: Request, res: Response) => {
  const _package = await fs.readFileSync(`${appRoot}/package.json`, 'utf-8')
  const jsonPackage = JSON.parse(_package)
  res.send({ code: 0, data: { version: jsonPackage.version }, msg: '' })
})

export default router
