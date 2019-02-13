import { BigNumber } from '@0x/utils'
import { IDexOrder, IMarket } from 'types'
import format from 'date-fns/format'

export const DAI_SYMBOL = '⬙'
export const ETHER_SYMBOL = 'Ξ'
export const MIN_POINTS_TO_DRAW_CHART = 2

export const getQuoteAssetSymbol = (market: IMarket): string =>
  market.quoteAsset.symbol === 'DAI' ? DAI_SYMBOL : ETHER_SYMBOL

export const delay = ts => new Promise(resolve => setTimeout(resolve, ts))

export const formatAssetAmount = (
  assetAmount: string | number,
  decimals: number = 18,
  digits: number = 6
): string => (new BigNumber(assetAmount).dividedBy(Math.pow(10, decimals)).toFixed(digits))

export const toBN = (value: string | number | null | undefined): BigNumber => new BigNumber(value || 0)

export const trimChars = (
  target: string,
  charsToTrim: string = ' ',
  { fromLeft = true, fromRight = true } = {}
): string => {
  const escapedChars = charsToTrim.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  const charsAsArray = escapedChars.split('')

  let pattern = ''
  if (fromLeft) {
    pattern += `^[${charsAsArray.join('')}]+`
  }

  if (fromRight) {
    pattern += (fromLeft ? '|' : '') + `[${charsAsArray.join('')}]+$`
  }

  const trimer = new RegExp(pattern, 'g')
  return target.replace(trimer, '')
}

export const getFormattedMarketPrice = (market: IMarket, addQuoteAssetSymbol: boolean = true) => {
  const { price } = market

  let symbol = ''
  if (addQuoteAssetSymbol) {
    symbol = getQuoteAssetSymbol(market) + ' '
  }

  return symbol + formatMarketPrice(price)
}

export const getFormattedMarketEthPrice = (market: IMarket, addQuoteAssetSymbol: boolean = true): string => {
  const { priceEth: price } = market

  return (addQuoteAssetSymbol ? ETHER_SYMBOL + ' ' : '') + formatMarketPrice(price)
}

export const getFormattedMarketVolume = (market: IMarket, addQuoteAssetSymbol: boolean = true) => {
  const {
    quoteAsset: { decimals },
    stats: { volume24Hours: volume }
  } = market

  let symbol = ''
  if (addQuoteAssetSymbol) {
    symbol = getQuoteAssetSymbol(market) + ' '
  }

  return symbol + formatMarketVolume(volume, decimals)
}

export const formatMarketPrice = (price: BigNumber, toFixedDecimals = 7): string => {
  if (price.equals(0)) {
    return '0'
  }

  return trimChars(
    price.toFixed(toFixedDecimals),
    '0.',
    { fromRight: true, fromLeft: false }
  )
}

export const formatMarketVolume = (volume: BigNumber, assetDecimals: number = 18, toFixedDecimals = 2): string => {
  if (volume.equals(0)) {
    return '0'
  }

  return volume.dividedBy(Math.pow(10, assetDecimals)).toFixed(toFixedDecimals)
}

export const renderExpiresAt = (order: IDexOrder): string => {
  const date = new Date(order.order.expirationTimeSeconds.toNumber() * 1000)
  return format(date, 'MM/DD HH:mm')
}
