import React from 'react'
import jss from 'react-jss'

const decorate = jss({
  root: {},
  opacity: {
    opacity: 0.5
  }
})

/**
 * Make trailing zeros more transparent, add leading symbol if it needed
 * @property value {String} e.g. '0.0010'
 * @property ledBy {String} e.g. '$'
 *
 * How it works:
 * 0.0000 - wrap last three zeros in <span> with opacity
 * 0.0010 - wrap only last zero
 * 0.0002 - no wrapped zeros
 */
class FormattedAmount extends React.Component<any> {
  render () {
    const { classes, value, ledBy } = this.props

    const match = value.match(/(?<base>\d+\.\d+?)(?<zeros>0+)$/)

    const base = match ? match.groups.base : value
    const zeros = match ? <span className={classes.opacity}>{match.groups.zeros}</span> : ''

    return (
      <div className={classes.root}>
        {ledBy}{base}{zeros}
      </div>
    )
  }
}

export default decorate(FormattedAmount)
