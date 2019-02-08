import React from 'react'
import jss from 'react-jss'
import { format } from 'd3-format'
import { scaleLinear, scalePoint } from 'd3-scale'
import { curveStepBefore, curveStepAfter } from 'd3-shape'
import { ChartCanvas, Chart } from 'react-stockcharts'
import { AreaOnlySeries, BarSeries } from 'react-stockcharts/lib/series'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import HoverTooltip from './CustomHoverTooltip'
import { fitDimensions } from 'react-stockcharts/lib/helper'
import { Label } from 'react-stockcharts/lib/annotation'
import { withTheme } from '@material-ui/core/styles'
import equals from 'ramda/es/equals'
import CustomAreaOnlySeries from './CustomAreaOnlySeries'

const decorate = jss({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 200,
    minWidth: 200
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

class DepthChart extends React.Component<any> {
  // TODO fix multi-render and remove this method
  shouldComponentUpdate (nextProps: Readonly<any>, nextState: Readonly<{}>, nextContext: any): boolean {
    return !equals(nextProps, this.props)
  }
  render () {
    const { market, bids = [], asks = [], midMarketPrice, classes, theme } = this.props

    if (!bids.length && !asks.length) {
      return <div className={classes.loader}>Not enough data to build chart</div>
    }

    const maxVolume = Math.max(...bids.map(b => b.volumeSell), ...asks.map(a => a.volumeBuy))
    let data = [
      ...bids,
      ...asks
    ]

    if (midMarketPrice) {
      data.push({
        type: 'mid',
        showTooltip: false,
        price: midMarketPrice,
        maxVolume
      })
    }

    const { type, width, height, ratio } = this.props
    const xAccessor = d => parseFloat(d.price)
    const margin = { left: 0, right: 60, top: 10, bottom: 50 }
    const padding = { left: 20, right: 20, top: 16, bottom: 0 }

    const xExtents = list => list.map(d => xAccessor(d))
    const yExtents = d => [0, maxVolume * 1.2]
    const sortedData = data.sort((a, b) => xAccessor(a) - xAccessor(b))

    return (
      <ChartCanvas
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
        panEvent={false}
        clamp={true}
        fontSize={10}
      >
        {midMarketPrice &&
          <Label
            x={(width - margin.left - margin.right) / 2}
            y={10}
            fontSize={12}
            text={`Mid-market price ${midMarketPrice} ${market.quoteAsset.symbol}`}
          />
        }
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

export default fitDimensions(decorate(withTheme()(DepthChart)))

const volumeFormat = format('.4f')

function tooltipContent (market) {
  return ({ currentItem }) => {
    if (currentItem.extra) {
      return { x: null, y: [] }
    }

    const { type, price, volumeBuy, volumeSell } = currentItem
    let x: string
    let y: any[]

    if (type === 'mid') {
      x = `Mid price: ${price} ${market.quoteAsset.symbol}`
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
