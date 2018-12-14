import {
  convertDexOrderToSRA2Format,
  convertOrderToDexFormat,
  getDefaultOrderMetaData,
  trimChars
} from './helpers'
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

test('trimChars', async t => {
  t.test('alphaNumeric string', async t => {
    const origin = '1123abccc'
    const charsToTrim = '13ac'
    const trimmed = trimChars(origin, charsToTrim)
    const check = '23ab'
    t.equal(trimmed, check)

    const trimmedFromLeft = trimChars(
      origin,
      '13ac',
      { fromLeft: true, fromRight: false }
    )
    const checkLeft = '23abccc'
    t.equal(trimmedFromLeft, checkLeft)

    const trimmedFromRight = trimChars(
      origin,
      charsToTrim,
      { fromLeft: false, fromRight: true }
    )
    const checkRight = '1123ab'
    t.equal(trimmedFromRight, checkRight)

    t.end()
  })

  t.test('trailing / in uri', async t => {
    const uri = 'http://example.com/'
    const trimmed = trimChars(uri, '/')
    const check = 'http://example.com'

    t.equal(trimmed, check)

    t.end()
  })

})
