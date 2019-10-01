import * as moment from 'moment'

export const logs = []

export const log = data => {
  const timestamp = moment().format()
  logs.push({ timestamp, data })
}
