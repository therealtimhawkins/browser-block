import * as moment from 'moment'

export const transactions = [
  {
    id: 0,
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

export const initTransactions = data => {
  transactions.pop()
  data.forEach(transaction => {
    transactions.push(transaction)
  })
}
