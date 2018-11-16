import React from 'react'
import { connect } from 'react-redux'
import { loadAccountTradeHistory } from 'modules/index'
import ReactTable from 'react-table'
import { BigNumber } from '@0x/utils'

const connector = connect(
  state => ({
    accountHistory: state.accountHistory,
    account: state.account,
    tokens: state.tokens
  }),
  { loadAccountTradeHistory }
)

class OrdersHistoryList extends React.Component {
  // FIXME tech debt
  tokenDecimals = 18

  componentDidMount () {
    this.props.loadAccountTradeHistory(this.props.account)
  }

  render () {
    const { accountHistory, tokens } = this.props

    if (accountHistory.length === 0) {
      return null
    }

    return (
      <ReactTable
        data={accountHistory}
        showPagination={false}
        defaultPageSize={accountHistory.length}
        pageSize={accountHistory.length}
        resizable={false}
        columns={[
          {
            Header: 'Sold',
            id: 'sold',
            minWidth: 80,
            accessor: one => {
              const [makerToken] = tokens.filter(token => token.address === one.makerAssetAddress)
              return `${this.formatAssetAmount(one.makerAssetFilledAmount)} ${makerToken.symbol}`
            },
            style: {
              fontSize: '.7em'
            }
          },
          {
            Header: 'Bought',
            id: 'Bought',
            minWidth: 80,
            accessor: one => {
              const [takerToken] = tokens.filter(token => token.address === one.takerAssetAddress)
              return `${this.formatAssetAmount(one.takerAssetFilledAmount)} ${takerToken.symbol}`
            },
            style: {
              fontSize: '.7em'
            }
          }
        ]}
      />
    )
  }

  formatAssetAmount = assetAmount => {
    return new BigNumber(assetAmount)
      .dividedBy(Math.pow(10, this.tokenDecimals))
      .toFixed(6)
  }
}

export default connector(OrdersHistoryList)
