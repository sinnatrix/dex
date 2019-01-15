import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { withRouter } from 'react-router'
import { getMarketCandles } from 'selectors'
import { loadMarketCandles } from 'modules/global'
import compose from 'ramda/es/compose'
import Chart from './CandleStickChart'
import PriceChartIntervals from './PriceChartIntervals'

const connector = connect(
  state => ({
    candles: getMarketCandles(state)
  }),
  { loadMarketCandles }
)

const decorate = jss(() => ({
  intervals: {
    position: 'relative',
    marginLeft: 5,
    zIndex: 2
  },
  chart: {
    position: 'relative',
    top: -10,
    zIndex: 1
  }
}))

class PriceChart extends React.Component<any> {
  render () {
    const { classes, candles, chartInterval } = this.props

    const candlesWithData = candles.filter(one => one.open)

    if (candles.length === 0) {
      return <div>Loading...</div>
    }

    if (candlesWithData.length < 2) {
      return <div>Not Enough Data To Build Chart</div>
    }

    return (
      <>
        <PriceChartIntervals className={classes.intervals} />
        <Chart type={'svg'} data={candles} interval={chartInterval} className={classes.chart}/>
      </>
    )
  }
}

export default compose(
  connector,
  decorate
)(PriceChart)
