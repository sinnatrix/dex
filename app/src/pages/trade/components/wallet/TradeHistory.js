import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { loadAccountTradeHistory } from 'modules/index'
import ReactTable from 'react-table'
import { formatTokenAssetAmountToFixed } from 'helpers/general'
import EtherscanLink from 'components/EtherscanLink'

const cellStyle = {
  fontSize: '0.7em',
  display: 'flex',
  justifyContent: 'center',
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
    accountHistory: state.accountHistory,
    account: state.account,
    tokens: state.tokens
  }),
  { loadAccountTradeHistory }
)

class TradeHistory extends React.Component {
  // FIXME tech debt
  tokenDecimals = 18

  componentDidMount () {
    this.props.loadAccountTradeHistory(this.props.account)
  }

  render () {
    const { accountHistory, tokens, classes } = this.props

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
              return `
                ${formatTokenAssetAmountToFixed({ token: makerToken, assetAmount: one.makerAssetFilledAmount })}
                ${makerToken.symbol}
              `
            },
            style: cellStyle
          },
          {
            Header: 'Bought',
            id: 'Bought',
            minWidth: 80,
            accessor: one => {
              const [takerToken] = tokens.filter(token => token.address === one.takerAssetAddress)
              return `
                ${formatTokenAssetAmountToFixed({ token: takerToken, assetAmount: one.takerAssetFilledAmount })}
                ${takerToken.symbol}

              `
            },
            style: cellStyle
          },
          {
            Header: 'Etherscan',
            id: 'Etherscan',
            minWidth: 80,
            accessor: one => (
              <EtherscanLink
                className={classes.link}
                address={one.transactionHash}
                type='tx'
              />
            ),
            style: cellStyle
          }
        ]}
      />
    )
  }
}

export default connector(decorate(TradeHistory))
