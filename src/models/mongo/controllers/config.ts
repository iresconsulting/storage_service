import mongoose from 'mongoose'
import Config from '../models/config'

async function createConfig() {
  const id = new mongoose.Types.ObjectId()
  const config = await new Config({
    _id: id
  })
  await config.save()
  return config
}

async function getById({ id }: { id: string }) {
  return await Config.find({ _id: id })
}

async function updateIdentificationAuthForMint({ id, status }: { id: string, status: string }) {
  return await Config.findOneAndUpdate({ _id: id }, { identificationAuthForTransaction: status }, { new: true })
}

async function updateIdentificationAuthForTransaction({ id, status }: { id: string, status: string }) {
  return await Config.findOneAndUpdate({ _id: id }, { identificationAuthForMint: status }, { new: true })
}

async function reset({ id }: { id: string }) {
  return await Config.findOneAndUpdate({ _id: id }, {
    identificationAuthForMint: true,
    identificationAuthForTransaction: false
  }, { new: true })
}

export default {
  createConfig,
  getById,
  updateIdentificationAuthForMint,
  updateIdentificationAuthForTransaction,
  reset
}
