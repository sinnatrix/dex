import axios from 'axios'

class ApiService {
  async getTokenBySymbol (symbol) {
    const { data } = await axios(`/api/v1/tokens/${symbol}`)
    return data
  }

  async getTokens () {
    const { data } = await axios.get('/api/v1/tokens')
    return data
  }

  async createOrder (signedOrder) {
    await axios.post('/api/relayer/v2/order', signedOrder)
  }

  async getOrderbook (params) {
    const { data } = await axios('/api/relayer/v2/orderbook', { params })
    return data
  }

  async getAccountOrders (account) {
    const { data } = await axios.get(`/api/v1/accounts/${account}/orders`)
    return data
  }

  async getAccountTradeHistory (account) {
    const { data } = await axios.get(`/api/v1/accounts/${account}/history`)
    return data
  }

  async getTradeHistory (params) {
    const { data } = await axios.get(
      `/api/v1/tradeHistory`,
      {
        params
      }
    )

    return data
  }
}

export default ApiService
