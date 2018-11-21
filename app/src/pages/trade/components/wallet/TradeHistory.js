import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { loadAccountTradeHistory } from 'modules/index'
import ReactTable from 'react-table'
import { formatAssetAmount } from 'helpers/general'
import EtherscanLink from 'components/EtherscanLink'

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
    accountTradeHistory: state.accountTradeHistory,
    tokens: state.tokens
  }),
  { loadAccountTradeHistory }
)

class TradeHistory extends React.Component {
  componentDidMount () {
    this.props.loadAccountTradeHistory()
  }

  render () {
    const { accountTradeHistory, tokens, classes } = this.props

    if (accountTradeHistory.length === 0) {
      return null
    }

    return (
      <ReactTable
        data={accountTradeHistory}
        showPagination={false}
        defaultPageSize={accountTradeHistory.length}
        pageSize={accountTradeHistory.length}
        resizable={false}
        columns={[
          {
            Header: 'Sold',
            id: 'sold',
            minWidth: 80,
            accessor: one => {
              const [ makerToken ] = tokens.filter(token => token.address === one.makerAssetAddress)
              return `
                ${formatAssetAmount(one.makerAssetFilledAmount, { decimals: makerToken.decimals })}
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
              const [ takerToken ] = tokens.filter(token => token.address === one.takerAssetAddress)
              return `
                ${formatAssetAmount(one.takerAssetFilledAmount, { decimals: takerToken.decimals })}
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
            style: {
              ...cellStyle,
              justifyContent: 'center'
            }
          }
        ]}
      />
    )
  }
}

export default connector(decorate(TradeHistory))
