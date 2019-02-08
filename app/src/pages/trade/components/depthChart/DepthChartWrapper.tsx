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
          {!loaded
            ? <CircularProgress />
            : <DepthChart
                type={'svg'}
                bids={bids}
                asks={asks}
                midMarketPrice={midMarketPrice}
                market={market}
                ratio={3}
              />
          }
        </div>
      </div>
    )
  }

  prepareData ({ bids = [], asks = [] }: {bids: any[], asks: any[]}) {
    let asksMakerVolume = new BigNumber(0)
    let asksTakerVolume = new BigNumber(0)
    asks = asks.map(ask => {
      asksMakerVolume = asksMakerVolume.plus(ask.extra.remainingMakerAssetAmount)
      asksTakerVolume = asksTakerVolume.plus(ask.extra.remainingTakerAssetAmount)
      return {
        ...ask,
        asksMakerVolume: asksMakerVolume,
        asksTakerVolume: asksTakerVolume
      }
    })

    let bidsTakerVolume = new BigNumber(0)
    let bidsMakerVolume = new BigNumber(0)
    bids = reverse(reverse(bids).map((bid: any) => {
      bidsTakerVolume = bidsTakerVolume.plus(bid.extra.remainingTakerAssetAmount)
      bidsMakerVolume = bidsMakerVolume.plus(bid.extra.remainingMakerAssetAmount)
      return {
        ...bid,
        bidsTakerVolume: bidsTakerVolume,
        bidsMakerVolume: bidsMakerVolume
      }
    }))

    const askPrice = asks.length ? asks[0].extra.price : new BigNumber(0)
    const bidPrice = bids.length ? bids[bids.length - 1].extra.price : new BigNumber(0)
    const midMarketPrice = askPrice.plus(bidPrice).dividedBy(2).toFixed(7)

    bids = bids.reverse().map(bid => ({
      type: 'bid',
      price: bid.extra.price.toFixed(7),
      volumeSell: bid.bidsTakerVolume.toFixed(4),
      volumeBuy: bid.bidsMakerVolume.toFixed(4)
    }))

    asks = asks.map(ask => ({
      type: 'ask',
      price: ask.extra.price.toFixed(7),
      volumeBuy: ask.asksMakerVolume.toFixed(4),
      volumeSell: ask.asksTakerVolume.toFixed(4)
    }))

    return { bids, asks, midMarketPrice }
  }
}

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(DepthChartWrapper)
