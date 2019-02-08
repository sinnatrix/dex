import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { withRouter } from 'react-router'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getMarket, getOrderbookAsks, getOrderbookBids, getOrderbookLoaded } from 'selectors'
import DepthChart from './DepthChart'
import { BigNumber } from '@0x/utils'
import equals from 'ramda/es/equals'
import compose from 'ramda/es/compose'
import reverse from 'ramda/es/reverse'
import { IDepthChartPoint, IDexOrder, IDexOrderWithCummulativeVolumes, TOrder } from 'types'
import { first, last } from 'react-stockcharts/lib/utils'

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
    fontSize: '1.25em',
    marginBottom: 5,
    flex: 'none'
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

class DepthChartWrapper extends React.Component<any> {
  // TODO fix multi-render and remove this method
  shouldComponentUpdate (nextProps: Readonly<any>, nextState: Readonly<{}>, nextContext: any): boolean {
    return !equals(nextProps, this.props)
  }

  render () {
    let { market, classes, loaded } = this.props

    const { asks, bids, midMarketPrice } = this.prepareData({
      bids: this.props.bids,
      asks: this.props.asks
    })

    return (
      <div className={classes.root}>
        <div className={classes.title}>Depth chart</div>
        <div className={classes.chartRoot}>
          {!loaded && <CircularProgress />}
          {asks.length || bids.length
            ? <DepthChart
                type={'svg'}
                bids={bids}
                asks={asks}
                midMarketPrice={midMarketPrice}
                market={market}
                ratio={3}
              />
            : <div className={classes.loader}>Not enough data to render the chart</div>
          }
        </div>
      </div>
    )
  }

  prepareData ({ bids = [], asks = [] }: {bids: IDexOrder[], asks: IDexOrder[]}) {
    const asksWithVolumes = this.getCumulativeVolumesForOrders(asks)
    const bidsWithVolumes = reverse(this.getCumulativeVolumesForOrders(reverse(bids)))

    const midMarketPrice = this.getMidMarketPrice({
      asks: asksWithVolumes,
      bids: bidsWithVolumes
    })

    let preparedBids = bidsWithVolumes.reverse()
      .map(bid => this.convertOrderToDepthChartPoint(bid, 'bid'))

    let preparedAsks = asksWithVolumes
      .map(ask => this.convertOrderToDepthChartPoint(ask, 'ask'))

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
        // price: (parseFloat(lastBid.price) * 1.1).toFixed(7),
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
      asks: IDexOrderWithCummulativeVolumes[],
      bids: IDexOrderWithCummulativeVolumes[]
    }
  ): string | null => {
    const askPrice = asks.length ? first(asks).extra.price : null
    const bidPrice = bids.length ? last(bids).extra.price : null

    let midMarketPrice

    if (askPrice !== null && bidPrice !== null) {
      return askPrice.plus(bidPrice).dividedBy(2).toFixed(7)
    } else {
      return midMarketPrice = null
    }
  }

  getCumulativeVolumesForOrders = (orders: IDexOrder[]): IDexOrderWithCummulativeVolumes[] => {
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
    order: IDexOrderWithCummulativeVolumes,
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
