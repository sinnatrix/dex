import React from 'react'
import jss from 'react-jss'
import Panel from 'components/Panel'
import LimitOrderForm from './LimitOrderForm'
import MarketOrderForm from './MarketOrderForm'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

const decorate = jss({
  root: {}
})

class OrderPanel extends React.Component {
  state = {
    type: 'market'
  }

  handleTypeChange = (e, type) => {
    this.setState({
      type
    })
  }

  render () {
    const { classes } = this.props
    const { type } = this.state

    return (
      <Panel className={classes.root}>
        <Tabs value={type} onChange={this.handleTypeChange}>
          <Tab value='market' label='Market order' />
          <Tab value='limit' label='Limit order' />
        </Tabs>
        {type === 'market' &&
          <MarketOrderForm />
        }
        {type === 'limit' &&
          <LimitOrderForm />
        }
      </Panel>
    )
  }
}

export default decorate(OrderPanel)
