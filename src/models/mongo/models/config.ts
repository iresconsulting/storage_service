import mongoose from 'mongoose'
import { getDefaultDate } from '../utils'

const Schema = mongoose.Schema

const Config = new Schema({
  _id: { type: String, default: new mongoose.Types.ObjectId() },
  version: { type: String, default: '1.0' },
  identificationAuthForMint: { type: Boolean, default: true },
  identificationAuthForTransaction: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: getDefaultDate() }
})

export default mongoose.model('Config', Config)
