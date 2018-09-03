import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'
import compose from 'ramda/es/compose'
import OrdersTable from './OrdersTable'

const connector = connect(
  state => ({
    bids: state.bids,
    asks: state.asks
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

const Orderbook = ({ classes, bids, asks }) => {
  let orders = bids
  if (bids.length && asks.length) {
    const minBidPrice = bids[bids.length - 1].price
    const maxAskPrice = asks[0].price
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
      <Toolbar>
        <Typography variant='title'>Orderbook</Typography>
      </Toolbar>
      <OrdersTable orders={orders} />
    </div>
  )
}

export default compose(
  connector,
  decorate
)(Orderbook)
