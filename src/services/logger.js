import * as moment from 'moment'
const { deepParseJson } = require('deep-parse-json')

export const logs = []

export const logger = (title, message, data) => {
  const timestamp = moment().format('hh:mm:ss.SSS')
  logs.push({
    id: logs.length,
    timestamp,
    title,
    message,
    data: deepParseJson(data)
  })
}
