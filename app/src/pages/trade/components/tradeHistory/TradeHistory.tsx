import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ReactTable, { ReactTableDefaults } from 'react-table'
import { BigNumber } from '@0x/utils'
import { wsUnsubscribe } from 'modules/subscriptions'
import { ETHER_SYMBOL, toBN } from 'helpers/general'
import {
  getTokens,
  findTokenByAssetData,
  getAccount,
  getBaseAsset,
  getQuoteAsset,
  getMarket,
  getNetworkName
} from 'selectors'
import compose from 'ramda/es/compose'
import { TradeHistoryEntity, IMarket, IDexToken } from 'types'
import TrendArrow from '../TrendArrow'
import FormattedAmount from '../orderbook/FormattedAmount'
import TradeHistoryRow from './TradeHistoryRow'

const cellStyle = {
  display: 'flex',
  alignItems: 'center'
}

const decorate = jss({
  root: {
    fontSize: 12,
    border: 'none !important',
    '& *': {
      border: 'none !important'
    }
  },
  row: {
    height: 37,
    '&:hover': {
      backgroundColor: '#ccc',
      cursor: 'pointer'
    }
  },
  cell: {
    padding: '0 !important',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  link: {
    fontSize: '0.8em',
    minHeight: 0,
    padding: 5
  },
  trendIcon: {
    fontSize: 12
  }
})

const connector = connect(
  (state, ownProps) => ({
    account: getAccount(state),
    tokens: getTokens(state),
    baseAsset: getBaseAsset(ownProps.match.params, state),
    quoteAsset: getQuoteAsset(ownProps.match.params, state),
    market: getMarket(ownProps.match.params, state),
    network: getNetworkName(state)
  }),
  { wsUnsubscribe }
)

const TrComponent = props => {
  if (!props.data) {
    return <ReactTableDefaults.TrComponent {...props} />
  }

  return <TradeHistoryRow {...props} />
}

class TradeHistory extends React.Component<any> {
  render () {
    const {
      tradeHistory,
      tokens,
      classes,
      quoteAsset,
      baseAsset,
      market,
      network,
      columns = ['price', 'trend', 'amount', 'totalEth']
    } = this.props

    if (tradeHistory.length === 0) {
      return null
    }

    return (
      <ReactTable
        TrComponent={TrComponent}
        className={classes.root}
        data={tradeHistory}
        showPagination={false}
        defaultPageSize={tradeHistory.length}
        pageSize={tradeHistory.length}
        resizable={false}
        getTrProps={(state, rowInfo) => ({
          key: rowInfo.original.id,
          className: classes.row,
          data: rowInfo.original,
          network
        })}
        getTdProps={() => ({
          className: classes.cell
        })}
        columns={[
          {
            Header: `Price ${quoteAsset.symbol}`,
            id: 'price',
            sortable: false,
            minWidth: 80,
            accessor: one => <FormattedAmount value={ this.getPrice(one, market).toFixed(7) } />,
            style: cellStyle
          },
          {
            Header: '',
            id: 'trend',
            sortable: false,
            minWidth: 20,
            accessor: one => <TrendArrow
              value={ this.isBid(one, market) ? -1 : 1 }
              className={ classes.trendIcon }
            />,
            style: cellStyle
          },
          {
            Header: `Amount ${baseAsset.symbol}`,
            id: 'amount',
            sortable: false,
            minWidth: 80,
            accessor: one => <FormattedAmount value={ this.getAmount(one, market, tokens).toFixed(4) } />,
            style: cellStyle
          },
          {
            Header: `Total ETH`,
            id: 'totalEth',
            sortable: false,
            minWidth: 80,
            accessor: one => <FormattedAmount
              value={ this.getAmountEth(one, market, tokens).toFixed(4) }
              ledBy={ ETHER_SYMBOL }
            />,
            style: cellStyle
          }
        ].filter(one => columns.indexOf(one.id) !== -1)}
      />
    )
  }

  getPrice (tradeHistoryItem, market: IMarket): BigNumber {
    return this.isBid(tradeHistoryItem, market)
      ? tradeHistoryItem.takerAssetFilledAmount.dividedBy(tradeHistoryItem.makerAssetFilledAmount)
      : tradeHistoryItem.makerAssetFilledAmount.dividedBy(tradeHistoryItem.takerAssetFilledAmount)
  }

  getAmount (tradeHistoryItem: TradeHistoryEntity, market: IMarket, tokens: IDexToken[]): BigNumber {
    return this.isBid(tradeHistoryItem, market)
      ? this.getTakerAssetAmount(tradeHistoryItem, market, tokens)
      : this.getMakerAssetAmount(tradeHistoryItem, market, tokens)
  }

  getAmountEth = (tradeHistoryItem: TradeHistoryEntity, market: IMarket, tokens: IDexToken[]): BigNumber => {
    const price = market.quoteAsset.symbol === 'WETH'
      ? this.getPrice(tradeHistoryItem, market)
      : market.priceEth

    return price.mul(this.getAmount(tradeHistoryItem, market, tokens))
  }

  isBid = (tradeHistoryItem, market: IMarket): boolean =>
    tradeHistoryItem.takerAssetData === market.quoteAsset.assetData &&
    tradeHistoryItem.makerAssetData === market.baseAsset.assetData

  getMakerAssetAmount (tradeHistoryItem: TradeHistoryEntity, market: IMarket, tokens: IDexToken[]): BigNumber {
    const token = findTokenByAssetData(tradeHistoryItem.makerAssetData, tokens)
    return toBN(tradeHistoryItem.makerAssetFilledAmount)
      .dividedBy(Math.pow(10, token.decimals))
      .dividedBy(this.getPrice(tradeHistoryItem, market))
  }

  getTakerAssetAmount (tradeHistoryItem: TradeHistoryEntity, market: IMarket, tokens: IDexToken[]): BigNumber {
    const token = findTokenByAssetData(tradeHistoryItem.takerAssetData, tokens)
    return toBN(tradeHistoryItem.takerAssetFilledAmount)
      .dividedBy(Math.pow(10, token.decimals))
      .dividedBy(this.getPrice(tradeHistoryItem, market))
  }
}

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(TradeHistory)
