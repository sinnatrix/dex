import React from 'react'
import { connect } from 'react-redux'
import { loadActiveAccountOrders } from 'modules/index'
import ReactTable from 'react-table'
import format from 'date-fns/format'
import { formatAssetAmount } from 'helpers/general'

const connector = connect(
  state => ({
    accountOrders: state.accountOrders,
    account: state.account,
    tokens: state.tokens
  }),
  { loadActiveAccountOrders }
)

class OrdersList extends React.Component {
  componentDidMount () {
    this.props.loadActiveAccountOrders(this.props.account)
  }

  render () {
    const { accountOrders, tokens } = this.props

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
            Header: 'S',
            id: 'selling',
            minWidth: 80,
            accessor: order => {
              const [ makerToken ] = tokens.filter(token => token.address === order.makerAssetAddress)
              return `
                ${formatAssetAmount(order.makerAssetAmount, { decimals: makerToken.decimals })}
                ${makerToken.symbol}
              `
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
              const [ takerToken ] = tokens.filter(token => token.address === order.takerAssetAddress)
              return `
                ${formatAssetAmount(order.takerAssetAmount, { decimals: takerToken.decimals })}
                ${takerToken.symbol}
              `
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
}

export default connector(OrdersList)
