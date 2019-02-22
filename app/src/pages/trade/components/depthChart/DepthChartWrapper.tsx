import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { withRouter } from 'react-router'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getMarket, getOrderbookAsks, getOrderbookBids, getOrderbookLoaded } from 'selectors'
import DepthChart from './DepthChart'
import { BigNumber } from '@0x/utils'
import compose from 'ramda/es/compose'
import reverse from 'ramda/es/reverse'
import head from 'ramda/es/head'
import last from 'ramda/es/last'
import {
  IDepthChartPoint,
  IDexOrder,
  IDexOrderWithCumulativeVolumes,
  OrderType,
  TOrder
} from 'types'

const connector = connect(
  (state, ownProps) => ({
    bids: getOrderbookBids(ownProps.match.params, state),
    asks: getOrderbookAsks(ownProps.match.params, state),
    market: getMarket(ownProps.match.params, state),
    loaded: getOrderbookLoaded(state)
  })
)

const decorate = jss({
  root: {
    marginTop: 20,
    paddingLeft: 10,
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  chartRoot: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0
  },
  title: {
    marginBottom: 5,
    flex: 'none'
  },
  loader: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.8em'
  }
})

class DepthChartWrapper extends React.Component<any> {
  render () {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <div className={classes.title}>Depth chart</div>
        <div className={classes.chartRoot}>
          {this.renderChart()}
        </div>
      </div>
    )
  }

  renderChart () {
    const { asks, bids, midMarketPrice } = this.prepareData()
    const { market, classes, loaded } = this.props

    if (!loaded) {
      return (
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      )
    }

    if (!asks.length && !bids.length) {
      return (
        <div className={classes.loader}>Not enough data to render the chart</div>
      )
    }

    return (
      <DepthChart
        type={'svg'}
        bids={bids}
        asks={asks}
        midMarketPrice={midMarketPrice}
        market={market}
        ratio={3}
      />
    )
  }

  prepareData () {
    const { asks = [], bids = [] } = this.props

    const asksWithVolumes = this.getCumulativeVolumesForOrders(asks)
    const bidsWithVolumes = reverse(this.getCumulativeVolumesForOrders(reverse(bids)))

    const midMarketPrice = this.getMidMarketPrice({
      asks: asksWithVolumes,
      bids: bidsWithVolumes
    })

    let preparedBids = bidsWithVolumes.reverse()
      .map(bid => this.convertOrderToDepthChartPoint(bid, OrderType.BID))

    let preparedAsks = asksWithVolumes
      .map(ask => this.convertOrderToDepthChartPoint(ask, OrderType.ASK))

    let lastAsk
    if (preparedAsks.length) {
      lastAsk = last(preparedAsks)

      preparedAsks.push({
        ...lastAsk,
        showTooltip: false,
        price: '0',
        volumeBuy: (parseFloat(lastAsk.volumeBuy) * 1.1).toFixed(4)
      })
    }

    let lastBid
    if (preparedBids.length) {
      lastBid = last(preparedBids)

      const newPrice = lastAsk
        ? parseFloat(lastBid.price) + parseFloat(lastAsk.price)
        : parseFloat(lastBid.price) * 1.1

      preparedBids.push({
        ...lastBid,
        showTooltip: false,
        price: newPrice.toFixed(7),
        volumeSell: (parseFloat(lastBid.volumeSell) * 1.1).toFixed(4)
      })
    }

    return {
      bids: preparedBids,
      asks: preparedAsks,
      midMarketPrice
    }
  }

  getMidMarketPrice = (
    {
      asks = [],
      bids = []
    }: {
      asks: IDexOrderWithCumulativeVolumes[],
      bids: IDexOrderWithCumulativeVolumes[]
    }
  ): string | null => {
    const ask = head(asks)
    const bid = last(bids)

    let midMarketPrice

    if (ask && bid) {
      return ask.extra.price.plus(bid.extra.price).dividedBy(2).toFixed(7)
    } else {
      return midMarketPrice = null
    }
  }

  getCumulativeVolumesForOrders = (orders: IDexOrder[]): IDexOrderWithCumulativeVolumes[] => {
    let makerVolume = new BigNumber(0)
    let takerVolume = new BigNumber(0)
    return orders.map(order => {
      makerVolume = makerVolume.plus(order.extra.remainingMakerAssetAmount)
      takerVolume = takerVolume.plus(order.extra.remainingTakerAssetAmount)
      return {
        ...order,
        makerVolume: makerVolume,
        takerVolume: takerVolume
      }
    })
  }

  convertOrderToDepthChartPoint = (
    order: IDexOrderWithCumulativeVolumes,
    type: TOrder
  ): IDepthChartPoint => ({
    type,
    price: order.extra.price.toFixed(7),
    volumeSell: order.takerVolume.toFixed(4),
    volumeBuy: order.makerVolume.toFixed(4)
  })
}

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(DepthChartWrapper)
