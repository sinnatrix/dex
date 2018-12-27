import createStore from 'createStore'
import test from 'tape'
import { addSubscription } from './actions'
import { setMarkets, setTokens } from 'modules/global/actions'
import { processSocketMessage } from './thunks'
import { getOrderByHash } from 'modules/orders/selectors'
import { generateSRA2Order, generateMarket } from 'helpers/testUtils'
const uuidv4 = require('uuid/v4')

test('processSocketMessage', async t => {
  t.test('should process new orders message', async t => {
    const store = createStore()

    const channel = 'orders'
    const requestId = uuidv4()

    const market = generateMarket()

    store.dispatch(setMarkets([market]))

    store.dispatch(setTokens([
      market.baseAsset,
      market.quoteAsset
    ]))

    const subscription = {
      requestId,
      channel,
      name: 'orders',
      payload: {}
    }
    store.dispatch(addSubscription(subscription))

    const sra2Order = generateSRA2Order({
      makerAssetData: market.quoteAsset.assetData,
      takerAssetData: market.baseAsset.assetData
    })

    const message = {
      data: JSON.stringify({
        type: 'update',
        channel,
        requestId,
        payload: [ sra2Order ]
      })
    }

    await store.dispatch(processSocketMessage(
      message,
      {
        baseAssetSymbol: market.baseAsset.symbol,
        quoteAssetSymbol: market.quoteAsset.symbol
      }
    ))

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
