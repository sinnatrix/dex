import React from 'react'
import jss from 'react-jss'
import cx from 'classnames'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ReactTable, { ReactTableDefaults } from 'react-table'
import {
  getAccount,
  getMarket,
  getNetworkName,
  getAccountTradeHistory,
  getAccountTradeHistoryLoaded
} from 'selectors'
import compose from 'ramda/es/compose'
import TrendArrow from '../../TrendArrow'
import FormattedAmount from '../../orderbook/FormattedAmount'
import Row from './Row'
import CircularProgress from '@material-ui/core/CircularProgress'
import { loadAccountTradeHistory } from 'modules/tradeHistory'
import { getAmount, getPrice } from '../helpers'
import { EventType, TradeHistoryItemWithTokens, OrderType } from 'types'
import format from 'date-fns/format'
import CancelEventIcon from '@material-ui/icons/NotInterested'

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
  },
  flexWrapper: {
    display: 'flex',
    flex: 'none',
    alignContent: 'center'
  },
  tokenIcon: {
    width: 14,
    height: 14
  },
  cancelEventRow: {
    opacity: 0.5
  },
  cancelEventIcon: {
    size: 14,
    fontSize: 14
  },
  emptyHistory: {
    display: 'flex',
    flex: 1,
    fontSize: 14,
    padding: 30,
    justifyContent: 'center',
    alignContent: 'center'
  }
})

const connector = connect(
  (state, ownProps) => ({
    tradeHistory: getAccountTradeHistory(state),
    tradeHistoryLoaded: getAccountTradeHistoryLoaded(state),
    account: getAccount(state),
    market: getMarket(ownProps.match.params, state),
    network: getNetworkName(state)
  }),
  { loadAccountTradeHistory }
)

const TrComponent = props => {
  if (!props.data) {
    return <ReactTableDefaults.TrComponent {...props} />
  }

  return <Row {...props} />
}

class Table extends React.Component<any> {
  componentDidMount (): void {
    this.props.loadAccountTradeHistory()
  }

  render () {
    const {
      tradeHistoryLoaded,
      tradeHistory,
      classes,
      network
    } = this.props

    if (!tradeHistoryLoaded) {
      return this.renderLoader()
    }

    if (tradeHistory.length === 0) {
      return <div className={classes.emptyHistory}>No trade history entries yet</div>
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
          className: rowInfo.original.event === EventType.CANCEL
            ? cx(classes.row, classes.cancelEvent)
            : classes.row,
          data: rowInfo.original,
          network
        })}
        getTdProps={() => ({
          className: classes.cell
        })}
        columns={[
          {
            Header: `Price`,
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
            accessor: this.renderIcon,
            style: cellStyle
          },
          {
            Header: `Amount`,
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

  renderLoader = () => {
    return (
      <div className={this.props.classes.loader}>
        <CircularProgress />
      </div>
    )
  }

  renderIcon = (tradeHistoryItem: TradeHistoryItemWithTokens) => {
    const { classes } = this.props

    if (tradeHistoryItem.event === EventType.CANCEL) {
      return <CancelEventIcon className={classes.cancelEventIcon} />
    }

    let value: number

    if (tradeHistoryItem.orderType === OrderType.BID) {
      value = -1
    } else if (tradeHistoryItem.orderType === OrderType.ASK) {
      value = 1
    } else {
      value = 0
    }

    return (
      <TrendArrow
        value={value}
        className={ classes.trendIcon }
      />
    )
  }

  renderPrice = (tradeHistoryItem: TradeHistoryItemWithTokens) => {
    const { classes } = this.props
    const tokenIcon = <img
      className={classes.tokenIcon}
      src={`/token-icons/${tradeHistoryItem.tokens.quoteToken.symbol}.png`}
      alt=''
    />

    const price = getPrice(tradeHistoryItem)

    return (
      <div className={classes.flexWrapper}>
        {price
          ? <FormattedAmount value={ price.toFixed(7) } />
          : '?'
        }
        {tokenIcon}
      </div>
    )
  }

  renderAmount = (tradeHistoryItem: TradeHistoryItemWithTokens) => {
    const { classes } = this.props

    const tokenIcon = <img
      className={classes.tokenIcon}
      src={`/token-icons/${tradeHistoryItem.tokens.baseToken.symbol}.png`}
      alt=''
    />

    const amount = getAmount(tradeHistoryItem)

    return (
      <div className={classes.flexWrapper}>
        {amount
          ? <FormattedAmount value={ amount.toFixed(4) } />
          : '?'
        }
        {tokenIcon}
      </div>
    )
  }
}

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(Table)
