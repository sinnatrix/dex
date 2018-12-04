import { assetDataUtils } from '@0x/order-utils'

export const getAccount = state => state.global.account

export const getTokens = state => state.global.tokens.map(token => ({
  ...token,
  assetData: assetDataUtils.encodeERC20AssetData(token.address)
}))

export const getTokenBySymbol = (symbol, state) => state.global.tokens.find(one => one.symbol === symbol)

export const getMarketplaceToken = state => state.global.marketplaceToken
export const getCurrentToken = state => state.global.currentToken
