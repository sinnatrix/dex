import axios from 'axios'
import { IFillItem, IMarket, ITradeHistoryItem } from 'types'

interface IPaginatedRequest {
  page: number
  perPage: number
}

interface ITradeHistoryRequest {
  baseAssetData: string
  quoteAssetData: string
}

class ApiService {
  async loadTokenBySymbol (symbol) {
    const { data } = await axios(`/api/v1/tokens/${symbol}`)
    return data
  }

  async loadTokens (params: any = {}) {
    const { data } = await axios.get('/api/v1/tokens', { params })
    return data
  }

  async createOrder (signedOrder) {
    await axios.post('/api/0x/v2/order', signedOrder)
  }

  async loadOrderbook (params) {
    const { data } = await axios('/api/0x/v2/orderbook', { params })
    return data
  }

  async loadAccountOrders (account: string) {
    const { data } = await axios.get(`/api/v1/accounts/${account}/orders`)
    return data
  }

  async loadAccountTradeHistory (account: string): Promise<ITradeHistoryItem[]> {
    const { data } = await axios.get(`/api/v1/accounts/${account}/history`)
    return data
  }

  async loadTradeHistory (params: ITradeHistoryRequest & IPaginatedRequest): Promise<IFillItem[]> {
    const { data } = await axios.get(
      `/api/v1/tradeHistory`,
      {
        params
      }
    )

    return data
  }

  async loadMarkets (params: any = {}) {
    const { data } = await axios.get('/api/v1/markets', { params })
    return data
  }

  async loadMarket (marketId: string): Promise<IMarket> {
    const { data } = await axios.get(`/api/v1/market/${marketId}`)
    return data
  }

  async loadMarketCandles (marketId, params) {
    const { data } = await axios.get(`/api/v1/market/${marketId}/candles`, { params })
    return data
  }
}

export default ApiService
