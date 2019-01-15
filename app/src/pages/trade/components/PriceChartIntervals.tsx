import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { withRouter } from 'react-router'
import { getPriceChartIntervals } from 'selectors'
import compose from 'ramda/es/compose'
import { Button } from '@material-ui/core'
import { setPriceChartIntervalById } from 'modules/global'

const connector = connect(
  state => ({
    chartIntervals: getPriceChartIntervals(state)
  }),
  (dispatch, ownProps) => ({
    setPriceChartIntervalById (id) {
      return dispatch(setPriceChartIntervalById(ownProps.match.params, id))
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
  handleClick = ({ id }) => {
    this.props.setPriceChartIntervalById(id)
  }

  render () {
    const { classes, chartIntervals, className } = this.props
    return (
      <div className={className}>
        {chartIntervals.map(one =>
          <Button
            key={one.id}
            className={one.active ? classes.active : null}
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

export default compose(
  withRouter,
  connector,
  decorate
)(PriceChartIntervals)
