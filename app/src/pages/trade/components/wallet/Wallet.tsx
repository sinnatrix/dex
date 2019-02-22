import React from 'react'
import jss from 'react-jss'
import { withRouter } from 'react-router-dom'
import Panel from 'components/Panel'
import ConnectionWidget from './ConnectionWidget'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TokensList from './TokensList'
import OrdersList from './OrdersList'
import AccountTradeHistory from '../tradeHistory/account/Table'
import { connect } from 'react-redux'
import compose from 'ramda/es/compose'
import { getAccount } from 'selectors'

const connector = connect(
  state => ({
    account: getAccount(state)
  })
)

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
    flex: 1,
    flexDirection: 'column',
    padding: 0
  },
  tabRoot: {
    minWidth: '33%',
    fontSize: 12
  }
})

class Wallet extends React.Component<any> {
  state = {
    value: 0
  }

  handleChange = (e, value) => {
    this.setState({ value })
  }

  render () {
    const { classes, account } = this.props
    const { value } = this.state

    return (
      <Panel className={classes.root}>
        <ConnectionWidget />

        {!!account &&
          <>
            <Tabs onChange={this.handleChange} value={value}>
              <StyledTab label='Tokens'/>
              <StyledTab label='Orders'/>
              <StyledTab label='History'/>
            </Tabs>

            {value === 0 && <TokensList />}
            {value === 1 && <OrdersList />}
            {value === 2 && <AccountTradeHistory />}
          </>
        }
      </Panel>
    )
  }
}

export default (compose as any)(
  connector,
  decorate
)(Wallet)
