import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { withRouter } from 'react-router'
import compose from 'ramda/es/compose'
import { Button } from '@material-ui/core'
import { changePriceChartInterval } from 'modules/global'

const connector = connect(
  null,
  (dispatch, ownProps) => ({
    changePriceChartInterval (interval) {
      return dispatch(changePriceChartInterval(ownProps.match.params, interval))
    }
  })
)

const decorate = jss(() => ({
  root: {
    position: 'relative'

  },
  active: {
    backgroundColor: '#ccc',
    color: '#000'
  }
}))

class PriceChartIntervals extends React.Component<any> {
  intervals = [
    {
      id: '1d',
      name: '1 day',
      intervalSeconds: 24 * 60 * 60,
      groupIntervalSeconds: 3600,
      ticks: 6,
      tickFormat: '%H:%M'
    },
    {
      id: '1w',
      name: '1 week',
      intervalSeconds: 7 * 24 * 60 * 60,
      groupIntervalSeconds: 3 * 60 * 60,
      ticks: 6,
      tickFormat: '%a %d'
    },
    {
      id: '1m',
      name: '1 month',
      intervalSeconds: 30 * 24 * 60 * 60,
      groupIntervalSeconds: 24 * 60 * 60,
      ticks: 6,
      tickFormat: '%b %d'
    }
  ]

  handleClick = interval => {
    this.props.changePriceChartInterval(interval)
  }

  render () {
    const { classes, interval: activeInterval, className } = this.props
    return (
      <div className={className}>
        {this.intervals.map(one =>
          <Button
            key={one.id}
            className={one.id === activeInterval.id ? classes.active : null}
            onClick={() => this.handleClick(one)}
            size={'small'}
          >
            {one.name}
          </Button>
        )}
      </div>
    )
  }
}

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(PriceChartIntervals)
