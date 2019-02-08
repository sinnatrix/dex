import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { withRouter } from 'react-router'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getMarketCandles, getMarket, getActivePriceChartInterval } from 'selectors'
import { loadMarketCandles } from 'modules/global'
import PriceChart from './PriceChart'
import PriceChartIntervals from './PriceChartIntervals'
import compose from 'ramda/es/compose'
import { MIN_POINTS_TO_DRAW_CHART } from 'helpers/general'

const connector = connect(
  (state, ownProps) => ({
    candles: getMarketCandles(state),
    market: getMarket(ownProps.match.params, state),
    chartInterval: getActivePriceChartInterval(state)
  }),
  { loadMarketCandles }
)

const decorate = jss({
  root: {
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
    fontSize: 18,
    marginBottom: 5,
    flex: 'none'
  },
  loader: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

class PriceChartWrapper extends React.Component<any> {
  mounted = false

  state = {
    loaded: false
  }

  async componentDidMount () {
    this.mounted = true
    await this.loadCandles()
  }

  async componentWillUnmount () {
    this.mounted = false
  }

  async componentDidUpdate (prevProps: Readonly<any>, prevState: Readonly<{}>, snapshot?: any) {
    if (prevProps.market.id !== this.props.market.id) {
      await this.loadCandles()
    }
  }

  async loadCandles () {
    if (!this.mounted) {
      return
    }

    this.setState({ loaded: false })

    const now = Math.round((new Date()).getTime() / 1000)
    await this.props.loadMarketCandles(
      this.props.market,
      now - this.props.chartInterval.intervalSeconds,
      now,
      this.props.chartInterval.groupIntervalSeconds
    )

    if (this.mounted) {
      this.setState({ loaded: true })
    }
  }

  render () {
    const { classes, candles, chartInterval } = this.props
    const { loaded } = this.state

    const candlesWithData = candles.filter(one => one.open)

    return (
      <div className={classes.root}>
        <div className={classes.title}>Price chart</div>
        {!loaded
          ? <div className={classes.loader}>
              <CircularProgress />
            </div>
          : candlesWithData.length < MIN_POINTS_TO_DRAW_CHART
            ? <div className={classes.loader}>Not enough data to render the chart</div>
            : <>
                <PriceChartIntervals className={classes.intervals}/>
                <div className={classes.chartRoot}>
                  <PriceChart
                    type={'svg'}
                    data={candles}
                    interval={chartInterval}
                    ratio={3}
                  />
                </div>
              </>
        }
      </div>
    )
  }
}

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(PriceChartWrapper)
