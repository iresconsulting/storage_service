import moment from 'moment'

namespace DateCustomized {
  export function isValid(date: string) {
    const _isValid = moment(date).isValid()
    return _isValid
  }

  export function isValidRange({
    startDate,
    endDate
  }: { startDate: string, endDate: string }) {
    return moment(startDate) <= moment(endDate)
  }

  const ONGOING_FLAG = 'ongoing'

  export function getSerializedStartOfDay(str: string) {
    if (str === ONGOING_FLAG) {
      return moment().utc().add(100, 'days').startOf('day').toISOString()
    } else if (str === '' || str === 'start') {
      return moment('1976-01-01').startOf('day').utc().toISOString()
    }
    return moment(str).startOf('day').utc().toISOString()
  }

  export function getSerialized(str: string) {
    if (str === ONGOING_FLAG) {
      return moment().utc().add(100, 'days').toISOString()
    } else if (str === '' || str === 'start') {
      return moment('1976-01-01').utc().toISOString()
    }
    return moment(str).utc().toISOString()
  }

}

export default DateCustomized
