import React from 'react'
import jss from 'react-jss'
import cx from 'classnames'

const decorate = jss({
  root: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyItems: 'center'
  },
  bar: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    right: 0
  },
  value: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    zIndex: 1,
    justifyContent: 'center'
  }
})

class Progress extends React.Component<any> {
  MIN_BAR_WIDTH_PERCENT = 1
  MAX_BAR_WIDTH_PERCENT = 100
  REDUCE_FACTOR = 0.5 // reducer for progress bar related to parent width

  render () {
    const { classes, value, max, className: parentClassName } = this.props

    let barWidthPercent = value.greaterThanOrEqualTo(max)
      ? this.MAX_BAR_WIDTH_PERCENT
      : Math.floor(value.dividedBy(max).toNumber() * 100)

    barWidthPercent = barWidthPercent === 0 ? this.MIN_BAR_WIDTH_PERCENT : barWidthPercent * this.REDUCE_FACTOR

    const barStyle = {
      width: barWidthPercent + '%'
    }

    return (
      <div className={classes.root}>
        <div style={barStyle} className={ cx(parentClassName, classes.bar) }></div>
      </div>
    )
  }
}

export default decorate(Progress)
