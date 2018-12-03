import React from 'react'
import jss from 'react-jss'
import format from 'date-fns/format'
import ClipboardButton from './ClipboardButton'
import FillOrderButton from './FillOrderButton'
import createTrComponent from './createTrComponent'
import ReactTable, { ReactTableDefaults } from 'react-table'
import 'react-table/react-table.css'
import red from '@material-ui/core/colors/red'

ReactTableDefaults.TrComponent = createTrComponent(ReactTableDefaults.TrComponent)

const decorate = jss({
  root: {},
  highlight: {
    backgroundColor: red[500]
  },
  controlColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 !important'
  }
})

class OrdersTable extends React.Component {
  async componentDidMount () {
    await new Promise(resolve => setTimeout(resolve, 200))

    const spreadElement = document.querySelector('#orderbook-spread')
    if (spreadElement) {
      spreadElement.scrollIntoView({
        block: 'center',
        behavior: 'instant'
      })
    }
  }

  render () {
    /** @var orders array of bids */
    const { classes, orders } = this.props

    return (
      <ReactTable
        data={orders}
        showPagination={false}
        defaultPageSize={orders.length}
        pageSize={orders.length}
        getTrProps={(state, rowInfo, column) => {
          return {
            spread: rowInfo.original.spread,
            highlightClassName: !rowInfo.original.spread && rowInfo.original.extra.highlight ? classes.highlight : ''
          }
        }}
        columns={[
          {
            Header: 'price',
            id: 'price',
            accessor: order => order.spread ? null : order.extra.price.toFixed(6)
          },
          {
            Header: 'selling',
            id: 'selling',
            accessor: order => order.spread
              ? null
              : `${order.extra.remainingMakerAssetAmount.toFixed(6)} ${order.extra.makerToken.symbol}`
          },
          {
            Header: 'buying',
            id: 'buying',
            accessor: order => order.spread
              ? null
              : `${order.extra.remainingTakerAssetAmount.toFixed(6)} ${order.extra.takerToken.symbol}`
          },
          {
            Header: 'expires',
            id: 'expires',
            accessor: order => order.spread ? null : this.renderExpiresAt(order)
          },
          {
            Header: 'maker',
            id: 'maker',
            accessor: order => order.spread ? null : `${order.order.makerAddress}`
          },
          {
            Header: '',
            id: 'clipboard',
            Cell: ({ original: order }) => order.spread ? null : <ClipboardButton order={order} />,
            width: 50,
            className: classes.controlColumn
          },
          {
            Header: '',
            id: 'fill',
            Cell: ({ original: order }) => order.spread ? null : <FillOrderButton order={order} />,
            width: 64,
            className: classes.controlColumn
          }
        ]}
      />
    )
  }

  renderExpiresAt = order => {
    const date = new Date(parseInt(order.order.expirationTimeSeconds, 0) * 1000)
    return format(date, 'MM/DD HH:mm')
  }
}

export default decorate(OrdersTable)
