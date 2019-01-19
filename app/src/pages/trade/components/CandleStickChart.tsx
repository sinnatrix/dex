import React from 'react'
import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'
import { ChartCanvas, Chart } from 'react-stockcharts'
import {
  BarSeries,
  CandlestickSeries
} from 'react-stockcharts/lib/series'
import { XAxis, YAxis } from 'react-stockcharts/lib/axes'
import {
  CrossHairCursor,
  CurrentCoordinate,
  MouseCoordinateX,
  MouseCoordinateY
} from 'react-stockcharts/lib/coordinates'
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale'
import { OHLCTooltip, MovingAverageTooltip } from 'react-stockcharts/lib/tooltip'
import { fitDimensions } from 'react-stockcharts/lib/helper'
import { last } from 'react-stockcharts/lib/utils'

class CandleStickChart extends React.Component<any> {
  render () {
    const { type, data: initialData, width, ratio, interval, className } = this.props
    const xScaleProvider = discontinuousTimeScaleProvider
      .inputDateAccessor(d => d.date)
    const margin = { left: 5, right: 35, top: 30, bottom: 30 }
    const padding = { top: 0, right: 20, bottom: 0, left: 20 }
    const height = this.props.height - 16
    const yTicks = 6

    const {
      data,
      xScale,
      xAccessor,
      displayXAccessor
    } = xScaleProvider(initialData)
    const trueData = data.filter(one => one.volume)

    const start = xAccessor(data[0])
    const end = xAccessor(last(data))
    const xExtents = [start, end]

    return (
      <ChartCanvas
        height={height}
        ratio={ratio}
        width={width}
        margin={margin}
        type={type}
        seriesName=''
        data={trueData}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
        padding={padding}
        clamp={'both'}
        className={className}
      >
        <Chart
          id={1}
          yExtents={d => [ d.high * 1.25, d.low ]}
        >
          <XAxis
            axisAt='bottom'
            orient='bottom'
            ticks={interval.ticks}
          />
          <YAxis axisAt='right' orient='right' ticks={yTicks} />
          <MouseCoordinateY
            at='right'
            orient='right'
            fontSize={10}
            rectWidth={80}
            displayFormat={format('.7f')}
          />
          <CandlestickSeries
            wickStroke={'#000000'}
            wickStrokeWidth={5}
            widthRatio={0.5}
            stroke={'#000000'}
            candleStrokeWidth={1}
          />
          <OHLCTooltip
            origin={[ 0, 0 ]}
            ohlcFormat={format('.5f')}
            volumeFormat={format('.4f')}
            fontSize={10}
            fill={'#000'}
          />
        </Chart>
        <Chart
          id={2}
          origin={(w, h) => [0, h - height / yTicks / 2]}
          height={height / yTicks / 2}
          yExtents={d => d.volume}
        >
          <BarSeries
            yAccessor={d => d.volume}
            fill={'#ccc'}
          />
        </Chart>
        <CrossHairCursor strokeDasharray='LongDashDot' />
      </ChartCanvas>
    )
  }
}

export default fitDimensions(CandleStickChart)
