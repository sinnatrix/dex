import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ReactTable, { ReactTableDefaults } from 'react-table'
import {
  getAccount,
  getMarket,
  getNetworkName,
  getAssetPairTradeHistory,
  getAssetPairTradeHistoryLoaded
} from 'selectors'
import {
  getPrice,
  getAmount,
  isTradeHistoryItemForMarket
} from '../helpers'
import TrendArrow from '../../TrendArrow'
import FormattedAmount from '../../orderbook/FormattedAmount'
import Row from './Row'
import CircularProgress from '@material-ui/core/CircularProgress'
import compose from 'ramda/es/compose'
import { EventType, ITradeHistoryItem, OrderType } from 'types'
import format from 'date-fns/format'

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
  },
  loader: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const connector = connect(
  (state, ownProps) => ({
    tradeHistory: getAssetPairTradeHistory(state),
    tradeHistoryLoaded: getAssetPairTradeHistoryLoaded(state),
    account: getAccount(state),
    market: getMarket(ownProps.match.params, state),
    network: getNetworkName(state)
  })
)

const TrComponent = props => {
  if (!props.data) {
    return <ReactTableDefaults.TrComponent {...props} />
  }

  return <Row {...props} />
}

class Table extends React.Component<any> {
  render () {
    const {
      tradeHistoryLoaded,
      classes,
      market,
      network
    } = this.props

    const { baseAsset, quoteAsset } = market

    if (!tradeHistoryLoaded) {
      return this.renderLoader()
    }

    const tradeHistory = this.props.tradeHistory
      .filter(one => isTradeHistoryItemForMarket(one, market))

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
            accessor: this.renderPrice,
            style: cellStyle
          },
          {
            Header: '',
            id: 'trend',
            sortable: false,
            minWidth: 20,
            accessor: this.renderTrendArrow.bind(this),
            style: cellStyle
          },
          {
            Header: `Amount ${baseAsset.symbol}`,
            id: 'amount',
            sortable: false,
            minWidth: 80,
            accessor: this.renderAmount,
            style: cellStyle
          },
          {
            Header: `Time`,
            id: 'time',
            sortable: false,
            minWidth: 80,
            accessor: one => format(new Date(one.timestamp * 1000), 'MM/DD HH:mm'),
            style: cellStyle
          }
        ]}
      />
    )
  }

  renderLoader () {
    return (
      <div className={this.props.classes.loader}>
        <CircularProgress />
      </div>
    )
  }

  renderTrendArrow (tradeHistoryItem: ITradeHistoryItem) {
    const { classes } = this.props

    let value: number

    if (tradeHistoryItem.event === EventType.CANCEL) {
      value = 0
    } else {
      if (tradeHistoryItem.orderType === OrderType.BID) {
        value = -1
      } else if (tradeHistoryItem.orderType === OrderType.ASK) {
        value = 1
      } else {
        value = 0
      }
    }

    return (
      <TrendArrow
        value={value}
        className={ classes.trendIcon }
      />
    )
  }

  renderPrice (tradeHistoryItem: ITradeHistoryItem) {
    const price = getPrice(tradeHistoryItem)

    if (price) {
      return (
        <div>
          <FormattedAmount value={ price.toFixed(7) } />
        </div>
      )
    } else {
      return <div>?</div>
    }
  }

  renderAmount (tradeHistoryItem: ITradeHistoryItem) {
    const amount = getAmount(tradeHistoryItem)
    if (amount) {
      return (
        <div>
          <FormattedAmount value={ amount.toFixed(4) } />
        </div>
      )
    } else {
      return <div>?</div>
    }
  }
}

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(Table)
