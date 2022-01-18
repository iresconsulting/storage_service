import moment from 'moment-timezone'


namespace Logger {
  export const LOG_TIMEZONE = 'Asia/Taipei'

  export enum Labels {
    ENV = 'SYSTEM_ENV',
    HTTP = 'SYSTEM_HTTP',
    JOB = 'SYSTEM_JOB',
    METRICS = 'SYSTEM_METRICS',
    PUPPETEER = 'MODULE_PUPPETEER'
  }

  export function generateTimeLog({ label, message }: { label: Labels, message: string }) {
    const _timestamp = moment.tz(LOG_TIMEZONE).toISOString()
    console.log(`${_timestamp} [${label}] ${message}`)
  }
}

export default Logger
