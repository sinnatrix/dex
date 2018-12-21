import MarketService from './MarketService'
import { generateMarketDummy } from '../utils/testUtils'
const test = require('tape')
const sinon = require('sinon')

test.only('MarketService', async t =>{
  t.test('getMarkets works', async t => {
    const MarketService = {
      getMarkets: sinon.fake()
    }

    const markets = MarketService.getMarkets()

    t.equal(MarketService.getMarkets.callCount, 1)

    t.end()
  })
})