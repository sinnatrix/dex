import React from 'react'
import jss from 'react-jss'
import ArrowIcon from '@material-ui/icons/CallMade'
import RemoveIcon from '@material-ui/icons/Remove'
import cx from 'classnames'

const decorate = jss(theme => ({
  trendUp: {
    backgroundColor: theme.custom.askColor.main,
    color: theme.custom.askColor.contrastText,
    borderRadius: '0.2em'
  },
  trendDown: {
    transform: 'rotate(90deg)',
    backgroundColor: theme.custom.bidColor.main,
    color: theme.custom.bidColor.contrastText,
    borderRadius: '0.2em'
  },
  trendUnknown: {
    backgroundColor: theme.custom.bidColor.main,
    color: theme.custom.bidColor.contrastText,
    borderRadius: '0.2em'
  }
}))

class TrendArrow extends React.Component<any> {
  render () {
    const { classes, value = 0, className: parentClassName } = this.props
    const className = value > 0 ? classes.trendUp : classes.trendDown

    return (
      value
        ? <ArrowIcon className={cx(parentClassName, className)} />
        : <RemoveIcon className={cx(parentClassName, classes.trendUnknown)} />
    )
  }
}

export default decorate(TrendArrow)
