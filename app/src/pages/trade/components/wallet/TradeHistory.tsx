import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { wsUnsubscribe } from 'modules/subscriptions'
import ReactTable from 'react-table'
import { formatAssetAmount } from 'helpers/general'
import EtherscanLink from 'components/EtherscanLink'
import {
  getTokens,
  findTokenByAssetData,
  getAccount
} from 'modules/global/selectors'

const cellStyle = {
  fontSize: '0.7em',
  display: 'flex',
  alignItems: 'center'
}

const decorate = jss({
  link: {
    fontSize: '0.8em',
    minHeight: 0,
    padding: 5
  }
})

const connector = connect(
  state => ({
    account: getAccount(state),
    tokens: getTokens(state)
  }),
  { wsUnsubscribe }
)

class TradeHistory extends React.Component<any> {
  render () {
    const { tradeHistory, tokens, classes, account } = this.props

    if (tradeHistory.length === 0) {
      return null
    }

    return (
      <ReactTable
        data={tradeHistory}
        showPagination={false}
        defaultPageSize={tradeHistory.length}
        pageSize={tradeHistory.length}
        resizable={false}
        columns={[
          {
            Header: 'Sold',
            id: 'sold',
            sortable: false,
            minWidth: 80,
            accessor: one => {
              return this.getSoldAssetAmount(one, account, tokens)
            },
            style: cellStyle
          },
          {
            Header: 'Bought',
            id: 'Bought',
            sortable: false,
            minWidth: 80,
            accessor: one => {
              return this.getBoughtAssetAmount(one, account, tokens)
            },
            style: cellStyle
          },
          {
            Header: 'Etherscan',
            id: 'Etherscan',
            sortable: false,
            minWidth: 80,
            accessor: one => (
              <EtherscanLink
                className={classes.link}
                address={one.transactionHash}
                type='tx'
              />
            ),
            style: {
              ...cellStyle,
              justifyContent: 'center'
            }
          }
        ]}
      />
    )
  }

  getSoldAssetAmount (tradeHistoryItem, account: string, tokens): string {
    if (tradeHistoryItem.makerAddress === account) {
      return this.getMakerAssetAmount(tradeHistoryItem, tokens)
    } else {
      return this.getTakerAssetAmount(tradeHistoryItem, tokens)
    }
  }

  getBoughtAssetAmount (tradeHistoryItem, account: string, tokens): string {
    if (tradeHistoryItem.makerAddress === account) {
      return this.getTakerAssetAmount(tradeHistoryItem, tokens)
    } else {
      return this.getMakerAssetAmount(tradeHistoryItem, tokens)
    }
  }

  getMakerAssetAmount (tradeHistoryItem, tokens) {
    const token = findTokenByAssetData(tradeHistoryItem.makerAssetData, tokens)
    return `
      ${formatAssetAmount(tradeHistoryItem.makerAssetFilledAmount, token.decimals)}
      ${token.symbol}
    `
  }

  getTakerAssetAmount (tradeHistoryItem, tokens) {
    const token = findTokenByAssetData(tradeHistoryItem.takerAssetData, tokens)
    return `
      ${formatAssetAmount(tradeHistoryItem.takerAssetFilledAmount, token.decimals)}
      ${token.symbol}
    `
  }
}

export default connector(decorate(TradeHistory))
