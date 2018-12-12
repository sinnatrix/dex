import { assetDataUtils } from '@0x/order-utils'
import { BigNumber } from '@0x/utils'
import { IDexToken } from 'types'

export const DEFAULT_TOKEN = {
  id: 0,
  assetData: '',
  address: '',
  proxyId: '',
  minAmount: new BigNumber(0),
  maxAmount: new BigNumber(Number.MAX_SAFE_INTEGER),
  precision: 8,
  decimals: 18,
  symbol: '?',
  name: 'Unknown token',
  abi: {}
}

export const getAccount = state => state.global.account

export const getTokens = state => state.global.tokens.map(token => ({
  ...token,
  assetData: assetDataUtils.encodeERC20AssetData(token.address)
}))

export const getTokenBySymbol = (symbol: string, state): IDexToken =>
  state.global.tokens.find(one => one.symbol === symbol) || DEFAULT_TOKEN

export const getMarketplaceToken = state => state.global.marketplaceToken
export const getCurrentToken = state => state.global.currentToken

export const findTokenByAssetData = (assetData: string, tokens: IDexToken[]): IDexToken =>
  tokens.find(token => token.assetData === assetData) || DEFAULT_TOKEN
