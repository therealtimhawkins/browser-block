import * as moment from 'moment'

export const logs = []

export const logger = message => {
  const timestamp = moment().format()
  logs.push({ timestamp, message })
}
