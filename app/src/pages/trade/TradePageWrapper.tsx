import React from 'react'
import { connect } from 'react-redux'
import TradePage from './TradePage'
import { getMarkets } from 'selectors'

const connector = connect(
  state => ({
    markets: getMarkets(state)
  })
)

const TradePageWrapper = ({ markets, ...rest }) =>
  markets.length ? <TradePage {...rest} /> : null

export default connector(TradePageWrapper)
