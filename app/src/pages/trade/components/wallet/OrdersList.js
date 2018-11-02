import React from 'react'
import { connect } from 'react-redux'
import { loadUserOrdersByMakerAddress } from 'modules/index'
import ReactTable from 'react-table'
import format from 'date-fns/format'
import { BigNumber } from '@0x/utils'

const connector = connect(
  state => ({
    userOrders: state.userOrders,
    account: state.account,
    tokens: state.tokens
  }),
  { loadUserOrdersByMakerAddress }
)

class OrdersList extends React.Component {
  // FIXME tech debt
  tokenDecimals = 18

  componentDidMount () {
    this.props.loadUserOrdersByMakerAddress(this.props.account)
  }

  render () {
    const { userOrders, tokens } = this.props

    return (
      userOrders.length > 0 && <ReactTable
        data={userOrders}
        showPagination={false}
        defaultPageSize={userOrders.length}
        pageSize={userOrders.length}
        columns={[
          {
            Header: 'S',
            id: 'selling',
            accessor: order => `${this.formatAssetAmount(order.makerAssetAmount)}`
          },
          {
            Header: 'B',
            id: 'buying',
            accessor: order => `${this.formatAssetAmount(order.takerAssetAmount)}`
          },
          {
            Header: 'EXP',
            id: 'expires',
            accessor: order => this.renderExpiresAt(order)
          }
        ]}
      />
    )
  }

  renderExpiresAt = order => {
    const date = new Date(parseInt(order.expirationTimeSeconds, 0) * 1000)
    return format(date, 'MM/DD HH:mm')
  }

  formatAssetAmount = (assetAmount) => {
    return new BigNumber(assetAmount)
      .dividedBy(Math.pow(10, this.tokenDecimals))
      .toFixed(6)
  }
}

export default connector(OrdersList)
