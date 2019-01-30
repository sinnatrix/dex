import React from 'react'
import jss from 'react-jss'
import Panel from 'components/Panel'
import ConnectionWidget from './ConnectionWidget'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TokensList from './TokensList'
import OrdersList from './OrdersList'
import TradeHistory from '../tradeHistory/TradeHistory'
import { connect } from 'react-redux'
import compose from 'ramda/es/compose'
import { loadAccountTradeHistory } from 'modules/tradeHistory'
import { getAccountTradeHistory } from 'modules/tradeHistory/selectors'
import { getAccount } from 'selectors'

const TradeHistoryContainer = connect(
  state => ({
    tradeHistory: getAccountTradeHistory(state)
  })
)(TradeHistory)

const connector = connect(
  state => ({
    account: getAccount(state)
  }),
  { loadAccountTradeHistory }
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
    flex: 'none',
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

    // FIXME
    if (value === 2) {
      this.props.loadAccountTradeHistory()
    }
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
            {value === 2 && <TradeHistoryContainer />}
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
