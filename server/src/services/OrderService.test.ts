import OrderService from './OrderService'
import { BigNumber } from '@0x/utils'
import { OrderStatus } from '@0x/contract-wrappers'
import { generateSignedOrder } from '../utils/testUtils'
import { convertOrderToDexFormat, getDefaultOrderMetaData } from '../utils/helpers'
const test = require('tape')
const sinon = require('sinon')

test('updateOrderInfoByHash', async t => {
  const signedOrder = generateSignedOrder()

  const metaData = getDefaultOrderMetaData(signedOrder)
  const sra2Order = {
    order: signedOrder,
    metaData
  }

  const dexOrder = convertOrderToDexFormat(sra2Order)

  const saveFake = sinon.fake()

  const connection = {
    getCustomRepository () {
      return {
        save: saveFake,
        findOne () {
          return dexOrder
        }
      }
    }
  }

  const orderHash = '0x121'

  const orderBlockchainService = {
    async getOrderInfoAsync () {
      return {
        orderHash,
        orderStatus: OrderStatus.FILLABLE,
        orderTakerAssetFilledAmount: new BigNumber(0)
      }
    }
  }

  const orderService = new OrderService({ connection, orderBlockchainService })
  await orderService.updateOrderInfoByHash(orderHash)

  t.equal(saveFake.lastCall.args[0].orderTakerAssetFilledAmount, '0')

  t.end()
})
