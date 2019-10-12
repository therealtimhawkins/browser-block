import * as moment from 'moment'

export const transactions = []

export const logger = data => {
  const timestamp = moment().format('hh:mm:ss.SSS')
  transactions.push({
    id: transactions.length,
    timestamp,
    data
  })
}
