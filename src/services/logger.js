import * as moment from 'moment'

export const logs = []

export const logger = (title, message) => {
  const timestamp = moment().format('hh:mm:ss.SSS')
  logs.push({ id: logs.length, timestamp, title, message })
}
