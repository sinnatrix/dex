import React from 'react'
import { connect } from 'react-redux'
import { loadActiveAccountOrders } from 'modules/orders'
import ReactTable from 'react-table'
import format from 'date-fns/format'
import { formatAssetAmount } from 'helpers/general'
import { getAccountOrders } from 'modules/orders/selectors'

const connector = connect(
  state => ({
    accountOrders: getAccountOrders(state)
  }),
  { loadActiveAccountOrders }
)

class OrdersList extends React.Component<any> {
  componentDidMount () {
    this.props.loadActiveAccountOrders()
  }

  render () {
    const { accountOrders } = this.props

    if (accountOrders.length === 0) {
      return null
    }

    return (
      <ReactTable
        data={accountOrders}
        showPagination={false}
        defaultPageSize={accountOrders.length}
        pageSize={accountOrders.length}
        resizable={false}
        columns={[
          {
            Header: 'Sold',
            id: 'selling',
            minWidth: 80,
            accessor: order => {
              return `
                ${formatAssetAmount(order.order.makerAssetAmount, { decimals: order.extra.makerToken.decimals })}
                ${order.extra.makerToken.symbol}
              `
            },
            style: {
              fontSize: '.7em'
            }
          },
          {
            Header: 'Bought',
            id: 'buying',
            minWidth: 80,
            accessor: order => {
              return `
                ${formatAssetAmount(order.order.takerAssetAmount, { decimals: order.extra.takerToken.decimals })}
                ${order.extra.takerToken.symbol}
              `
            },
            style: {
              fontSize: '.7em'
            }
          },
          {
            Header: 'Expires',
            id: 'expires',
            minWidth: 80,
            accessor: order => this.renderExpiresAt(order),
            style: {
              fontSize: '.7em'
            }
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

export default connector(OrdersList)
