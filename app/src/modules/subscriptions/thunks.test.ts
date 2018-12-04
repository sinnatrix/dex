import createStore from 'createStore'
import test from 'tape'
import { assetDataUtils } from '@0x/order-utils'
import { addSubscription } from './actions'
import { setCurrentToken, setMarketplaceToken, setTokens } from 'modules/global/actions'
import { processSocketMessage } from './thunks'
import { getOrderByHash } from 'modules/orders/selectors'
import { generateERC20Token, generateSRA2Order } from 'helpers/testUtils'
const uuidv4 = require('uuid/v4')

test('processSocketMessage', async t => {
  t.test('should process new orders message', async t => {
    const store = createStore()

    const channel = 'orders'
    const requestId = uuidv4()

    const currentToken = generateERC20Token()
    const marketplaceToken = generateERC20Token()

    const marketplaceTokenAssetData = assetDataUtils.encodeERC20AssetData(marketplaceToken.address)
    const currentTokenAssetData = assetDataUtils.encodeERC20AssetData(currentToken.address)

    store.dispatch(setCurrentToken(currentToken))
    store.dispatch(setMarketplaceToken(marketplaceToken))

    store.dispatch(setTokens([
      currentToken,
      marketplaceToken
    ]))

    const subscription = {
      requestId,
      channel,
      name: 'orders',
      payload: {}
    }
    store.dispatch(addSubscription(subscription))

    const sra2Order = generateSRA2Order({
      makerAssetData: marketplaceTokenAssetData,
      takerAssetData: currentTokenAssetData
    })

    const message = {
      data: JSON.stringify({
        type: 'update',
        channel,
        requestId,
        payload: [ sra2Order ]
      })
    }

    await store.dispatch(processSocketMessage(message))

    const orderByHash = getOrderByHash(sra2Order.metaData.orderHash, store.getState())

    t.deepEqual(
      orderByHash,
      {
        ...sra2Order,
        extra: {}
      }
    )

    t.end()
  })
})
