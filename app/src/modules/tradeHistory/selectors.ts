import { convertTradeHistoryDecimalsToBigNumbers } from './helpers'
import {
  IIndexedType,
  IState,
  ITokensState,
  ITradeHistoryItem,
  TradeHistoryItemWithTokens
} from 'types'
import { createSelector } from 'reselect'
import { getTokenByAssetData } from 'selectors'

export const getAccountTradeHistory = createSelector(
  (state: IState): string[] =>
    state.tradeHistory.accountTradeHistory,
  (state: IState): IIndexedType<ITradeHistoryItem> =>
    state.tradeHistory.tradeHistory,
  (state: IState): ITokensState =>
    state.global.tokens,
  (
    accountTradeHistory: string[],
    tradeHistory: IIndexedType<ITradeHistoryItem>,
    tokensState: ITokensState
  ): TradeHistoryItemWithTokens[] =>
    accountTradeHistory.map(id => {
      const tradeHistoryItem = tradeHistory[id]

      return {
        ...convertTradeHistoryDecimalsToBigNumbers(tradeHistoryItem),
        tokens: {
          baseToken: getTokenByAssetData(tradeHistoryItem.baseAssetData, tokensState),
          quoteToken: getTokenByAssetData(tradeHistoryItem.quoteAssetData, tokensState),
          makerToken: getTokenByAssetData(tradeHistoryItem.makerAssetData, tokensState),
          takerToken: getTokenByAssetData(tradeHistoryItem.takerAssetData, tokensState)
        }
      }
    })
)

export const getAssetPairTradeHistory = createSelector(
  (state: IState): string[] =>
    state.tradeHistory.assetPairTradeHistory,
  (state: IState): IIndexedType<ITradeHistoryItem> =>
    state.tradeHistory.tradeHistory,
  (state: IState): ITokensState =>
    state.global.tokens,
  (
    assetPairTradeHistory: string[],
    tradeHistory: IIndexedType<ITradeHistoryItem>,
    tokensState: ITokensState
  ): TradeHistoryItemWithTokens[] =>
    assetPairTradeHistory.map(id => {
      const tradeHistoryItem = tradeHistory[id]

      return {
        ...convertTradeHistoryDecimalsToBigNumbers(tradeHistoryItem),
        tokens: {
          baseToken: getTokenByAssetData(tradeHistoryItem.baseAssetData, tokensState),
          quoteToken: getTokenByAssetData(tradeHistoryItem.quoteAssetData, tokensState),
          makerToken: getTokenByAssetData(tradeHistoryItem.makerAssetData, tokensState),
          takerToken: getTokenByAssetData(tradeHistoryItem.takerAssetData, tokensState)
        }
      }
    })
)

export const getAssetPairTradeHistoryLoaded = (state: IState): boolean =>
  state.tradeHistory.assetPairTradeHistoryLoaded

export const getAccountTradeHistoryLoaded = (state: IState): boolean =>
  state.tradeHistory.accountTradeHistoryLoaded
