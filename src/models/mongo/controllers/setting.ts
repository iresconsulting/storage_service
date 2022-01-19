import mongoose from 'mongoose'
import Setting from '../models/setting'

async function createSetting() {
  const id = new mongoose.Types.ObjectId()
  const setting = await new Setting({
    _id: id
  })
  await setting.save()
  return setting
}

async function updateSettingAllFieldsUnsafe({ id, setting }: { id: string, setting: any }) {
  return await Setting.findOneAndUpdate({ _id: id }, { ...setting }, { new: true })
}

async function getSettingById({ id }: { id: string }) {
  return await Setting.find({ _id: id })
}

export default {
  createSetting,
  getSettingById,
  updateSettingAllFieldsUnsafe
}
