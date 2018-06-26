import React from 'react'
import jss from 'react-jss'
import {connect} from 'react-redux'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'
import format from 'date-fns/format'
import compose from 'ramda/es/compose'
import ClipboardButton from './ClipboardButton'
import SpreadRow from './SpreadRow'
import red from '@material-ui/core/colors/red'
import ReactTable, {ReactTableDefaults} from 'react-table'
import 'react-table/react-table.css'

const DefaultRowComponent = ReactTableDefaults.TrComponent

ReactTableDefaults.TrComponent = props => {
  const {spread, ...resultProps} = props
  if (spread) {
    return <SpreadRow spread={spread} />
  }
  return <DefaultRowComponent {...resultProps} />
}

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
  },
  row: {
    transition: 'background-color 1000ms linear'
  },
  highlight: {
    backgroundColor: red[500]
  },
  clipboardColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 !important'
  }
})

class Orderbook extends React.Component {
  componentDidUpdate (prevProps) {
    if (this.props.bids !== prevProps.bids || this.props.asks !== prevProps.asks) {
      const spreadElement = document.querySelector('#orderbook-spread')
      if (spreadElement) {
        spreadElement.scrollIntoView({
          block: 'center',
          behavior: 'instant'
        })
      }
    }
  }

  render () {
    const {classes, bids, asks} = this.props
    if (bids.length === 0 && asks.length === 0) {
      return null
    }

    let orders = bids
    if (bids.length && asks.length) {
      const minBidPrice = bids[bids.length - 1].price
      const maxAskPrice = asks[0].price
      const spread = {
        value: minBidPrice.minus(maxAskPrice)
      }
      orders = orders.concat({spread})
    }
    orders = orders.concat(asks)

    return (
      <div className={classes.root}>
        <Toolbar>
          <Typography variant='title'>Orderbook</Typography>
        </Toolbar>
        <ReactTable
          data={orders}
          resolveData={data => data.map(row => row)}
          showPagination={false}
          defaultPageSize={orders.length}
          pageSize={orders.length}
          getTrProps={(state, rowInfo, column) => {
            return {
              spread: rowInfo.original.spread
            }
          }}
          columns={[
            {
              Header: 'price',
              id: 'price',
              accessor: order => order.spread ? null : order.price.toFixed(6)
            },
            {
              Header: 'selling',
              id: 'selling',
              accessor: order => order.spread ? null : `${order.makerAmount.toFixed(6)} ${order.makerToken.symbol}`
            },
            {
              Header: 'buying',
              id: 'buying',
              accessor: order => order.spread ? null : `${order.takerAmount.toFixed(6)} ${order.takerToken.symbol}`
            },
            {
              Header: 'expires',
              id: 'expires',
              accessor: order => order.spread ? null : this.renderExpiresAt(order)
            },
            {
              Header: '',
              id: 'clipboard',
              Cell: ({original: order}) => order.spread ? null : <ClipboardButton order={order} />,
              width: 50,
              className: classes.clipboardColumn
            }
          ]}
        />
      </div>
    )
  }

  // renderOrder = order => {
  //   const {classes} = this.props
  //   return (
  //     <TableRow key={order.order.orderHash} className={cx(classes.row, order.highlight && classes.highlight)}>
  //       <TableCell>{order.price.toFixed(6)}</TableCell>
  //       <TableCell>{order.makerAmount.toFixed(6)} {order.makerToken.symbol}</TableCell>
  //       <TableCell>{order.takerAmount.toFixed(6)} {order.takerToken.symbol}</TableCell>
  //       <TableCell>{this.renderExpiresAt(order)}</TableCell>
  //       <TableCell><ClipboardButton order={order} /></TableCell>
  //     </TableRow>
  //   )
  // }

  renderExpiresAt = order => {
    const date = new Date(parseInt(order.order.expirationUnixTimestampSec, 0) * 1000)
    return format(date, 'MM/DD HH:ss')
  }
}

export default compose(
  connector,
  decorate
)(Orderbook)
