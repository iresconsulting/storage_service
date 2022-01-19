import mongoose from 'mongoose'
import { getDefaultDate } from '../utils'

const Schema = mongoose.Schema

const System = new Schema({
  _id: { type: String, default: new mongoose.Types.ObjectId() },
  mintAddress: { type: String, default: '' },
  lastUpdated: { type: Date, default: getDefaultDate() }
})

export default mongoose.model('System', System)
