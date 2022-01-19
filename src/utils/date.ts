import moment from 'moment'

export function isValidDate(date: string) {
  const _isValid = moment(date).isValid()
  if (!_isValid) {
    throw new Error('invalid date')
  }
}

export function isValidDateRange({
  startDate,
  endDate
}: { startDate: string, endDate: string }) {
  return moment(startDate) <= moment(endDate)
}

const ONGOING_FLAG = 'ongoing'

export function getSerializedDateStartOfDay(str: string) {
  if (str === ONGOING_FLAG) {
    return moment().utc().add(100, 'days').startOf('day').toISOString()
  } else if (str === '' || str === 'start') {
    return moment('1976-01-01').startOf('day').utc().toISOString()
  }
  return moment(str).startOf('day').utc().toISOString()
}

export function getSerializedDate(str: string) {
  if (str === ONGOING_FLAG) {
    return moment().utc().add(100, 'days').toISOString()
  } else if (str === '' || str === 'start') {
    return moment('1976-01-01').utc().toISOString()
  }
  return moment(str).utc().toISOString()
}
