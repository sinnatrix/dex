import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import FillOrderButton from './FillOrderButton'
import createTrComponent from './createTrComponent'
import ReactTable, { ReactTableDefaults } from 'react-table'
import 'react-table/react-table.css'
import red from '@material-ui/core/colors/red'
import { getQuoteAsset, getBaseAsset, getMarket } from 'selectors'
import compose from 'ramda/es/compose'
import { IDexOrder, IMarket } from 'types'
import { BigNumber } from '@0x/utils'
import { ETHER_SYMBOL } from 'helpers/general'
import Progress from './Progress'
import FormattedAmount from './FormattedAmount'

const connector = connect(
  (state, ownProps) => {
    return {
      baseAsset: getBaseAsset(ownProps.match.params, state),
      quoteAsset: getQuoteAsset(ownProps.match.params, state),
      market: getMarket(ownProps.match.params, state)
    }
  }
)

const decorate = jss(theme => ({
  root: {
    fontSize: 12,
    border: 'none !important'
  },
  rowGroup: {
    border: 'none !important'
  },
  row: {
    border: 'none !important',
    '&:hover': {
      backgroundColor: '#ccc'
    }
  },
  cell: {
    padding: '0 !important',
    border: 'none !important',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  highlight: {
    backgroundColor: red[500]
  },
  controlColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 !important'
  },
  bidProgressBackground: {
    backgroundColor: theme.custom.bidColor.light
  },
  askProgressBackground: {
    backgroundColor: theme.custom.askColor.light
  },
  totalEth: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& > *': {
      position: 'absolute'
    }
  }
}))

class OrdersTable extends React.Component<any> {
  async componentDidMount () {
    await new Promise(resolve => setTimeout(resolve, 200))

    const spreadElement = document.querySelector('#orderbook-spread')
    if (spreadElement) {
      spreadElement.scrollIntoView({
        block: 'center',
        behavior: 'instant'
      } as any)
    }
  }

  render () {
    const { classes, orders, quoteAsset, baseAsset, market } = this.props

    const ethCap = this.getEthCap(
      orders.filter(order => !order.spread),
      market
    )

    return (
      <ReactTable
        TrComponent={createTrComponent()}
        className={classes.root}
        data={orders}
        showPagination={false}
        defaultPageSize={orders.length}
        pageSize={orders.length}
        getTrProps={(state, rowInfo) => {
          return {
            key: rowInfo.original.spread ? 'spread' : rowInfo.original.metaData.orderHash,
            spread: rowInfo.original.spread,
            highlightClassName: !rowInfo.original.spread && rowInfo.original.extra.highlight ? classes.highlight : '',
            className: classes.row,
            data: rowInfo.original
          }
        }}
        getTrGroupProps={() => {
          return {
            className: classes.rowGroup
          }
        }
        }
        getTdProps={() => {
          return {
            className: classes.cell
          }
        }}
        columns={[
          {
            Header: `Price ${quoteAsset.symbol}`,
            id: 'price',
            sortable: false,
            accessor: order => order.spread
              ? null
              : <FormattedAmount value={ order.extra.price.toFixed(7) } />
          },
          {
            Header: `Amount ${baseAsset.symbol}`,
            id: 'amount',
            sortable: false,
            accessor: order => order.spread
              ? null
              : <FormattedAmount value={ this.getOrderAmount(order, market).toFixed(4) } />
          },
          {
            Header: 'Total ETH',
            id: 'totalEth',
            sortable: false,
            accessor: order => order.spread
              ? null
              : <div className={classes.totalEth}>
                  <Progress
                    value={ this.getOrderAmountEth(order, market) }
                    max={ ethCap }
                    className={
                      this.isBid(order, market)
                        ? classes.bidProgressBackground
                        : classes.askProgressBackground
                    }
                  />
                <FormattedAmount
                  value={ this.getOrderAmountEth(order, market).toFixed(4) }
                  ledBy={ETHER_SYMBOL}
                />
              </div>
          },
          {
            Header: '',
            id: 'fill',
            sortable: false,
            Cell: ({ original: order }) => order.spread ? null : <FillOrderButton order={order} />,
            width: 64,
            className: classes.controlColumn
          }
        ]}
      />
    )
  }

  getOrderAmount = (order: IDexOrder, market: IMarket): BigNumber =>
    this.isBid(order, market) ? order.extra.remainingMakerAssetAmount : order.extra.remainingTakerAssetAmount

  getOrderAmountEth = (order: IDexOrder, market: IMarket): BigNumber => {
    const price = market.quoteAsset.symbol === 'WETH'
      ? order.extra.price
      : market.priceEth

    return price.mul(this.getOrderAmount(order, market))
  }

  isBid = (order, market: IMarket): boolean =>
    !order.spread && order.order.takerAssetData === market.quoteAsset.assetData &&
      order.order.makerAssetData === market.baseAsset.assetData

  getEthCap = (orders: IDexOrder[], market: IMarket): BigNumber => {
    const CAP = 0.8
    const amounts = orders.map(order => this.getOrderAmountEth(order, market)).sort()
    const capIndex = Math.ceil((amounts.length - 1) * CAP)
    return amounts[capIndex]
  }
}

export default compose(
  withRouter,
  connector,
  decorate
)(OrdersTable)
