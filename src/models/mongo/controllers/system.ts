import mongoose from 'mongoose'
import System from '../models/system'

async function createSystem() {
  const id = new mongoose.Types.ObjectId()
  const system = await new System({
    _id: id
  })
  await system.save()
  return system
}

async function getSystemById({ id }: { id: string }) {
  return await System.find({ _id: id })
}

// TODO types
async function updateSystemAllUnsafe(config: any) {
  return await System.findOneAndUpdate({ _id: config.id }, { ...config }, { new: true })
}

// TODO remove
// async function updatePromotionValue({ id, value }: { id: string, value: string }) {
//   return await System.findOneAndUpdate({ _id: id }, {
//     $set: { 'promotion.value': value }
//   }, { new: true })
// }

export default {
  createSystem,
  getSystemById,
  updateSystemAllUnsafe,
}
