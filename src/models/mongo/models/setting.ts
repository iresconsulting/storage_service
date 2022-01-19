import mongoose from 'mongoose'
import { getDefaultDate } from '../utils'

const Schema = mongoose.Schema

const Setting = new Schema({
  _id: { type: String, default: new mongoose.Types.ObjectId() },
  lastUpdated: { type: Date, default: getDefaultDate() }
})

export default mongoose.model('Setting', Setting)
