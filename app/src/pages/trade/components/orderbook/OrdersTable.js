import React from 'react'
import jss from 'react-jss'
import format from 'date-fns/format'
import ClipboardButton from './ClipboardButton'
import createTrComponent from './createTrComponent'
import ReactTable, { ReactTableDefaults } from 'react-table'
import 'react-table/react-table.css'
import red from '@material-ui/core/colors/red'

ReactTableDefaults.TrComponent = createTrComponent(ReactTableDefaults.TrComponent)

const decorate = jss({
  root: {},
  // row: {
  //   transition: 'background-color 1000ms linear'
  // },
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
    const { classes, orders } = this.props
    return (
      <ReactTable
        data={orders}
        resolveData={data => data.map(row => row)}
        showPagination={false}
        defaultPageSize={orders.length}
        pageSize={orders.length}
        getTrProps={(state, rowInfo, column) => {
          return {
            spread: rowInfo.original.spread,
            highlightClassName: rowInfo.original.highlight ? classes.highlight : ''
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
            Header: 'maker',
            id: 'maker',
            accessor: order => order.maker
          },
          {
            Header: '',
            id: 'clipboard',
            Cell: ({ original: order }) => order.spread ? null : <ClipboardButton order={order} />,
            width: 50,
            className: classes.clipboardColumn
          }
        ]}
      />
    )
  }

  renderExpiresAt = order => {
    const date = new Date(parseInt(order.order.data.expirationUnixTimestampSec, 0) * 1000)
    return format(date, 'MM/DD HH:ss')
  }
}

export default decorate(OrdersTable)
