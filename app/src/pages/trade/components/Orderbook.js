import React from 'react'
import jss from 'react-jss'
import {connect} from 'react-redux'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'
import format from 'date-fns/format'
import compose from 'ramda/es/compose'
import ClipboardButton from './ClipboardButton'
import cx from 'classnames'
import red from '@material-ui/core/colors/red'

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
    overflowY: 'auto'
  },
  row: {
    transition: 'background-color 1000ms linear'
  },
  highlight: {
    backgroundColor: red[500]
  }
})

class Orderbook extends React.Component {
  render () {
    const {classes, bids, asks} = this.props
    return (
      <div className={classes.root}>
        {this.renderOrdersTable(bids, 'Bids')}
        {this.renderOrdersTable(asks, 'Asks')}
      </div>
    )
  }

  renderOrdersTable (orders, title) {
    return (
      <React.Fragment>
        <Toolbar>
          <Typography variant='title'>{title}</Typography>
        </Toolbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>price</TableCell>
              <TableCell>selling</TableCell>
              <TableCell>buying</TableCell>
              <TableCell>expires</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map(this.renderOrder)}
          </TableBody>
        </Table>
      </React.Fragment>
    )
  }

  renderOrder = order => {
    const {classes} = this.props
    return (
      <TableRow key={order.order.orderHash} className={cx(classes.row, order.highlight && classes.highlight)}>
        <TableCell>{order.price.toString()}</TableCell>
        <TableCell>{order.makerAmount.toString()} {order.makerToken.symbol}</TableCell>
        <TableCell>{order.takerAmount.toString()} {order.takerToken.symbol}</TableCell>
        <TableCell>{this.renderExpiresAt(order)}</TableCell>
        <TableCell><ClipboardButton order={order} /></TableCell>
      </TableRow>
    )
  }

  renderExpiresAt = order => {
    const date = new Date(parseInt(order.order.expirationUnixTimestampSec, 0) * 1000)
    return format(date, 'MM/DD HH:ss')
  }
}

export default compose(
  connector,
  decorate
)(Orderbook)
