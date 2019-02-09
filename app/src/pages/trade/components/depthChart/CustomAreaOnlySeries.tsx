// https://raw.githubusercontent.com/rrag/react-stockcharts/16cab83f7a3c41a30fb5ecf5d3789d709063904d/src/lib/series/AreaOnlySeries.js
import React from 'react'
import { area as d3Area } from 'd3-shape'

import GenericChartComponent from 'react-stockcharts/lib/GenericChartComponent'
import { getAxisCanvas } from 'react-stockcharts/lib/GenericComponent'

import { hexToRGBA, isDefined, first, functor } from 'react-stockcharts/lib/utils'

class CustomAreaOnlySeries extends React.Component<any> {
  constructor (props) {
    super(props)
    this.renderSVG = this.renderSVG.bind(this)
    this.drawOnCanvas = this.drawOnCanvas.bind(this)
  }
  drawOnCanvas (ctx, moreProps) {
    const { yAccessor, defined, base, canvasGradient, dataFilter } = this.props
    const { fill, stroke, opacity, interpolation, canvasClip } = this.props

    const { xScale, chartConfig: { yScale }, plotData, xAccessor } = moreProps

    if (canvasClip) {
      ctx.save()
      canvasClip(ctx, moreProps)
    }

    if (canvasGradient != null) {
      ctx.fillStyle = canvasGradient(moreProps, ctx)
    } else {
      ctx.fillStyle = hexToRGBA(fill, opacity)
    }
    ctx.strokeStyle = stroke

    ctx.beginPath()
    const newBase = functor(base)
    const areaSeries = d3Area()
      .defined(d => defined(yAccessor(d)))
      .x((d) => Math.round(xScale(xAccessor(d))))
      .y0((d) => newBase(yScale, d, moreProps))
      .y1((d) => Math.round(yScale(yAccessor(d))))
      .context(ctx)

    if (isDefined(interpolation)) {
      areaSeries.curve(interpolation)
    }
    areaSeries(plotData.filter(dataFilter))
    ctx.fill()

    if (canvasClip) {
      ctx.restore()
    }
  }
  renderSVG (moreProps) {
    const { yAccessor, defined, base, style, dataFilter } = this.props
    const { stroke, fill, className, opacity, interpolation } = this.props

    const { xScale, chartConfig: { yScale }, plotData, xAccessor } = moreProps

    const newBase = functor(base)
    const areaSeries = d3Area()
      .defined(d => defined(yAccessor(d)))
      .x((d) => Math.round(xScale(xAccessor(d))))
      .y0((d) => newBase(yScale, d, moreProps))
      .y1((d) => Math.round(yScale(yAccessor(d))))

    if (isDefined(interpolation)) {
      areaSeries.curve(interpolation)
    }

    const d = areaSeries(plotData.filter(dataFilter))
    const newClassName = className.concat(isDefined(stroke) ? '' : ' line-stroke')
    return (
      <path
        style={style}
        d={d}
        stroke={stroke}
        fill={hexToRGBA(fill, opacity)}
        className={newClassName}

      />
    )
  }

  render () {
    return (
      <GenericChartComponent
        svgDraw={this.renderSVG}
        canvasDraw={this.drawOnCanvas}
        canvasToDraw={getAxisCanvas}
        drawOn={['pan']}
      />
    )
  }
}

(CustomAreaOnlySeries as any).defaultProps = {
  className: 'line ',
  fill: 'none',
  opacity: 1,
  defined: d => !isNaN(d),
  dataFilter: d => true,
  base: (yScale /* , d, moreProps */) => first(yScale.range())
}

export default CustomAreaOnlySeries
