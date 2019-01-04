import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { loadActiveAccountOrders } from 'modules/orders'
import ReactTable from 'react-table'
import format from 'date-fns/format'
import { formatAssetAmount } from 'helpers/general'
import { getAccountOrders } from 'modules/orders/selectors'
import CancelOrderButton from './CancelOrderButton'
import compose from 'ramda/es/compose'

const connector = connect(
  (state, ownProps) => {
    return { accountOrders: getAccountOrders(ownProps.match.params, state) }
  },
  { loadActiveAccountOrders }
)

const decorate = jss({
  controlColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 !important'
  }
})

class OrdersList extends React.Component<any> {
  componentDidMount () {
    this.props.loadActiveAccountOrders()
  }

  render () {
    const { accountOrders, classes } = this.props

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
        getTrProps={(state, rowInfo) => ({
          key: rowInfo.original.metaData.orderHash
        })}
        columns={[
          {
            Header: 'Selling',
            id: 'selling',
            sortable: false,
            minWidth: 80,
            accessor: order => {
              return `
                ${formatAssetAmount(order.order.makerAssetAmount, order.extra.makerToken.decimals)}
                ${order.extra.makerToken.symbol}
              `
            },
            style: {
              fontSize: '.7em'
            }
          },
          {
            Header: 'Buying',
            id: 'buying',
            sortable: false,
            minWidth: 80,
            accessor: order => {
              return `
                ${formatAssetAmount(order.order.takerAssetAmount, order.extra.takerToken.decimals)}
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
            sortable: false,
            minWidth: 80,
            accessor: order => this.renderExpiresAt(order),
            style: {
              fontSize: '.7em'
            }
          },
          {
            Header: '',
            id: 'cancel',
            sortable: false,
            Cell: ({ original: order }) => <CancelOrderButton order={order} />,
            width: 30,
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

export default compose(
  withRouter,
  connector,
  decorate
)(OrdersList)
