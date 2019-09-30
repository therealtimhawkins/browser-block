const axios = require('axios')

const logger = async data => {
  axios({
    method: 'post',
    url: 'http://localhost:1992/handshake/log',
    data
  })
}

export default logger
