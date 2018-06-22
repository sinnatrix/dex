import {BigNumber} from '@0xproject/utils'

export const generateBid = ({order, baseToken, quoteToken}) => {
  const makerToken = order.makerTokenAddress === baseToken.address ? baseToken : quoteToken
  const takerToken = order.takerTokenAddress === baseToken.address ? baseToken : quoteToken

  const decimalFields = [
    'expirationUnixTimestampSec',
    'makerFee',
    'makerTokenAmount',
    'salt',
    'takerFee',
    'takerTokenAmount'
  ]

  decimalFields.forEach(key => {
    order = {
      ...order,
      [key]: new BigNumber(order[key])
    }
  })

  const makerAmount = order.makerTokenAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  )
  const takerAmount = order.takerTokenAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )

  let price
  if (order.takerTokenAddress === baseToken.address) {
    price = takerAmount.dividedBy(makerAmount)
  } else {
    price = makerAmount.dividedBy(takerAmount)
  }

  const bid = {
    order,
    price,
    makerToken,
    takerToken,
    makerAmount,
    takerAmount
  }

  return bid
}
