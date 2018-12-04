import test from 'tape-promise/tape'
import { assetDataUtils } from '@0x/order-utils'
import { generateSRA2Order, generateERC20Token } from 'helpers/testUtils'
import { convertOrderToClipboardData, orderAsBid } from './selectors'

test('convertOrderToClipboardData', async t => {
  const currentToken = generateERC20Token()
  const marketplaceToken = generateERC20Token()

  const marketplaceTokenAssetData = assetDataUtils.encodeERC20AssetData(marketplaceToken.address)
  const currentTokenAssetData = assetDataUtils.encodeERC20AssetData(currentToken.address)

  const sra2Order = generateSRA2Order({
    makerAssetData: marketplaceTokenAssetData,
    takerAssetData: currentTokenAssetData
  })

  const bid = orderAsBid(sra2Order, currentToken, marketplaceToken)

  const clipboardData = convertOrderToClipboardData(bid)

  t.ok(clipboardData)
})
