import { convertDexOrderToSRA2Format, convertOrderToDexFormat, getDefaultOrderMetaData } from './helpers'
import { generateSignedOrder } from './testUtils'
const test = require('tape')

test('convertDexOrderToSRA2Format', async t => {
  const signedOrder = generateSignedOrder()

  const metaData = getDefaultOrderMetaData(signedOrder)
  const sra2Order = {
    order: signedOrder,
    metaData
  }

  const dexOrder = convertOrderToDexFormat(sra2Order)

  t.deepEqual(convertDexOrderToSRA2Format(dexOrder), sra2Order)

  t.end()
})
