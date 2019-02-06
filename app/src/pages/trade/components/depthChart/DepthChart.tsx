import React from 'react'
import jss from 'react-jss'
import cx from 'classnames'
import { format } from 'd3-format'
import { scaleLinear, scalePoint } from 'd3-scale'
import { curveStepBefore, curveStepAfter } from 'd3-shape'
import { ChartCanvas, Chart } from 'react-stockcharts'
import { AreaOnlySeries, BarSeries } from 'react-stockcharts/lib/series'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import { HoverTooltip } from 'react-stockcharts/lib/tooltip'
import { fitDimensions } from 'react-stockcharts/lib/helper'
import { withTheme } from '@material-ui/core/styles'
import CustomAreaOnlySeries from './CustomAreaOnlySeries'

const decorate = jss({
  root: {}
})

class DepthChart extends React.Component<any> {
  render () {
    const { market, bids, asks, midMarketPrice, theme } = this.props

    if (!market || !bids.length || !asks.length || !midMarketPrice) {
      return <>Loading...</>
    }

    const maxVolume = Math.max(...bids.map(b => b.volumeSell), ...asks.map(a => a.volumeBuy))
    const data = [
      ...bids,
      ...asks,
      {
        type: 'mid',
        price: midMarketPrice,
        maxVolume
      }
    ]

    const { className, type, width, height, ratio, classes } = this.props
    const xAccessor = d => parseFloat(d.price)
    const margin = { left: 10, right: 60, top: 30, bottom: 60 }
    const padding = { left: 10, right: 20, top: 0, bottom: 0 }

    const xExtents = list => list.map(d => xAccessor(d))
    const yExtents = d => [0, maxVolume]
    const sortedData = data.sort((a, b) => xAccessor(a) - xAccessor(b))

    return (
      <ChartCanvas
        className={cx(className, classes.root)}
        ratio={ratio}
        width={width}
        height={height}
        margin={margin}
        padding={padding}
        type={type}
        seriesName='Depth'
        xExtents={xExtents}
        data={sortedData}
        xAccessor={xAccessor}
        displayXAccessor={xAccessor}
        xScale={scaleLinear()}
        zoomEvent={false}
        panEvent={true}
        clamp={true}
      >
        <Chart id={1} yExtents={yExtents}>
          <XAxis
            axisAt='bottom'
            orient='bottom'
            ticks={6}
          />
          <YAxis
            axisAt='right'
            orient='right'
            ticks={4}
          />
          <CustomAreaOnlySeries
            yAccessor={d => d.volumeBuy}
            fill={theme.custom.askColor.light}
            interpolation={curveStepAfter}
            dataFilter={d => d.type === 'ask'}
            opacity={0.5}
          />
          <CustomAreaOnlySeries
            yAccessor={d => d.volumeSell}
            fill={theme.custom.bidColor.light}
            interpolation={curveStepBefore}
            dataFilter={d => d.type === 'bid'}
            opacity={0.5}
          />
          <BarSeries
            yAccessor={d => d.maxVolume}
            fill={'#000'}
            width={1}
          />
          <HoverTooltip
            tooltipContent={tooltipContent(market)}
            fontSize={12}
          />
        </Chart>
      </ChartCanvas>
    )
  }
}

export default withTheme()(fitDimensions(decorate(DepthChart)))

const volumeFormat = format('.4f')

function tooltipContent (market) {
  return ({ currentItem }) => {
    const { type, price, volumeBuy, volumeSell } = currentItem
    let x: string
    let y: any[]

    if (type === 'mid') {
      x = `Mid-market price: ${price} ${market.quoteAsset.symbol}`
      y = []
    } else {
      x = `Price: ${price} ${market.quoteAsset.symbol}`

      const baseAssetVolume = type === 'bid' ? volumeSell : volumeBuy
      const quoteAssetVolume = type === 'bid' ? volumeBuy : volumeSell

      y = [
        {
          label: 'Total available',
          value: `${volumeFormat(baseAssetVolume)} ${market.baseAsset.symbol}`
        },
        {
          label: 'Total volume',
          value: `${volumeFormat(quoteAssetVolume)} ${market.quoteAsset.symbol}`
        }
      ]
    }

    return { x, y }
  }
}
