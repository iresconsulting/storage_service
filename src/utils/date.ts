import moment from 'moment'

export function validateDate(date: string){
  const _isValid = moment(date).isValid()
  if (!_isValid) {
    throw new Error('invalid date')
  }
}

export function validateDateRange({
  startDate,
  endDate
}: { startDate: string, endDate: string }) {
  return moment(startDate) <= moment(endDate)
}

export function serializeDateToStartOfDay(str: string) {
  if (str === 'ongoing') {
    return moment().utc().add(100, 'days').startOf('day').toISOString()
  } else if (str === '' || str === 'start') {
    return moment('1976-01-01').startOf('day').utc().toISOString()
  }
  return moment(str).startOf('day').utc().toISOString()
}

export function serializeDate(str: string) {
  if (str === 'ongoing') {
    return moment().utc().add(100, 'days').toISOString()
  } else if (str === '' || str === 'start') {
    return moment('1976-01-01').utc().toISOString()
  }
  return moment(str).utc().toISOString()
}
