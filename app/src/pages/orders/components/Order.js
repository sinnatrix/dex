import React from 'react'
import jss from 'react-jss'
import axios from 'axios'
import format from 'date-fns/format'
import SmartButton from 'material-ui-smart-button'

const decorate = jss({
  root: {
  },
  raw: {
    whiteSpace: 'pre-wrap'
  }
})

class Order extends React.Component {
  state = {
    order: null,
    error: ''
  }

  componentDidMount () {
    this.loadOrder(this.props.match.params.hash)
  }

  componentDidUpdate (prevProps) {
    if (this.props.match.params.hash !== prevProps.match.params.hash) {
      this.loadOrder(this.props.match.params.hash)
    }
  }

  validate = async () => {
    this.setState({
      error: ''
    })

    const { order } = this.state
    const { data: { error } } = await axios.post(`/api/v1/orders/${order.data.orderHash}/validate`)

    this.setState({
      error
    })
  }

  async loadOrder (hash) {
    const { data: order } = await axios.get(`/api/relayer/v0/orders/${hash}`)

    this.setState({
      order
    })
  }

  render () {
    const { classes } = this.props
    const { order, error } = this.state

    if (!order) {
      return null
    }

    const d = new Date(parseInt(order.data.expirationUnixTimestampSec, 0) * 1000)

    return (
      <div className={classes.root}>
        <SmartButton variant='raised' onClick={this.validate}>Validate</SmartButton>
        {error || 'valid'}
        <div>
          {format(d, 'YYYY-MM-DD')}
        </div>
        <div className={classes.raw}>
          {JSON.stringify(order, null, 2)}
        </div>
      </div>
    )
  }
}

export default decorate(Order)
