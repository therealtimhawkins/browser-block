import * as moment from 'moment'

export const transactions = [
  {
    id: 1,
    timestamp: moment().format('hh:mm:ss.SSS'),
    data: {
      message: 'Start of Transactions'
    }
  }
]

export const logTransaction = data => {
  const timestamp = moment().format('hh:mm:ss.SSS')
  transactions.push({
    id: transactions.length,
    timestamp,
    data
  })
}
