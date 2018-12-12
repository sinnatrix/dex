import { BigNumber } from '@0x/utils'

export const delay = ts => new Promise(resolve => setTimeout(resolve, ts))

export const formatAssetAmount = (
  assetAmount: string | number,
  decimals: number = 18,
  digits: number = 6
): string => (new BigNumber(assetAmount).dividedBy(Math.pow(10, decimals)).toFixed(digits))

export const toBN = (value: string | number): BigNumber => new BigNumber(value)
