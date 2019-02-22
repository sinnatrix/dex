import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import compose from 'ramda/es/compose'
import OrdersTable from './OrdersTable'
import {
  getOrderbookBids,
  getOrderbookAsks
} from 'modules/orders/selectors'

const connector = connect(
  (state, ownProps) => ({
    bids: getOrderbookBids(ownProps.match.params, state),
    asks: getOrderbookAsks(ownProps.match.params, state)
  })
)

const decorate = jss({
  root: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column'
  }
})

class Orderbook extends React.Component<any> {
  render () {
    const { classes, bids, asks } = this.props

    let orders = bids
    if (bids.length && asks.length) {
      const minBidPrice = bids[bids.length - 1].extra.price
      const maxAskPrice = asks[0].extra.price
      const spread = {
        value: minBidPrice.minus(maxAskPrice)
      }
      orders = orders.concat({ spread })
    }
    orders = orders.concat(asks)

    if (orders.length === 0) {
      return null
    }

    return (
      <div className={classes.root}>
        <OrdersTable orders={orders} />
      </div>
    )
  }
}

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(Orderbook)
