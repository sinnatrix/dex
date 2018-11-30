import { BigNumber } from '@0x/utils'

export const delay = ts => new Promise(resolve => setTimeout(resolve, ts))

export const formatAssetAmount = (assetAmount, { decimals = 18, digits = 6 } = {}) => {
  return new BigNumber(assetAmount)
    .dividedBy(Math.pow(10, decimals))
    .toFixed(digits)
}

export const toBN = value => new BigNumber(value)
