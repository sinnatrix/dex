import React from 'react'
import jss from 'react-jss'
import Panel from 'components/Panel'
import ConnectionWidget from './ConnectionWidget'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TokensList from './TokensList'
import OrdersList from './OrdersList'
import OrdersHistoryList from './OrdersHistoryList'

const StyledTab = jss({
  root: {
    minWidth: '33%'
  }
})(
  props => <Tab {...props} />
)

const decorate = jss({
  root: {
    display: 'flex',
    alignItems: 'left',
    flex: 'none',
    flexDirection: 'column',
    padding: 0
  },
  tabRoot: {
    minWidth: '33%'
  }
})

class Wallet extends React.Component {
  state = {
    value: 0
  }

  handleChange = (e, value) => {
    this.setState({ value })
  }

  render () {
    const { classes } = this.props
    const { value } = this.state

    return (
      <Panel className={classes.root}>
        <ConnectionWidget />
        <Tabs onChange={this.handleChange} value={value}>
          <StyledTab label='Tokens' />
          <StyledTab label='Orders' />
          <StyledTab label='History' />
        </Tabs>
        {value === 0 && <TokensList />}
        {value === 1 && <OrdersList />}
        {value === 2 && <OrdersHistoryList />}
      </Panel>
    )
  }
}

export default decorate(Wallet)
