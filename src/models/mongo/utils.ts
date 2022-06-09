import moment from 'moment'
import Logger from '~/src/utils/logger'

export const getDefaultDate = () => {
  return moment.tz(Logger.LOG_TIMEZONE).toISOString()
}
