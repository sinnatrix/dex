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
        resizable={false}
        columns={[
          {
            Header: 'S',
            id: 'selling',
            minWidth: 80,
            accessor: order => {
              const [makerToken] = tokens.filter(token => token.address === order.makerAssetAddress)
              return `${this.formatAssetAmount(order.makerAssetAmount)} ${makerToken.symbol}`
            },
            style: {
              fontSize: '.7em'
            }
          },
          {
            Header: 'B',
            id: 'buying',
            minWidth: 80,
            accessor: order => {
              const [takerToken] = tokens.filter(token => token.address === order.takerAssetAddress)
              return `${this.formatAssetAmount(order.takerAssetAmount)} ${takerToken.symbol}`
            },
            style: {
              fontSize: '.7em'
            }
          },
          {
            Header: 'EXP',
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
