import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { withRouter } from 'react-router'
import Layout from 'components/Layout'
import Wallet from './components/wallet/Wallet'
import Marketplace from './components/Marketplace'
import LimitOrderPanel from './components/LimitOrderPanel'
import Orderbook from './components/orderbook/Orderbook'
import TradeHistory from './components/tradeHistory/TradeHistory'
import PriceChart from './components/PriceChart'
import MessageListenerContainer from 'MessageListenerContainer'
import routerListener from 'hocs/routerListener'
import { loadOrderbook } from 'modules/orders'
import { loadAssetPairTradeHistory } from 'modules/tradeHistory'
import { loadMarketCandles } from 'modules/global'
import { getActivePriceChartInterval, getAssetPairTradeHistory, getMarket, getAccount } from 'selectors'
import compose from 'ramda/es/compose'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Panel from 'components/Panel'
import MarketplaceAllowances from './components/MarketplaceAllowances'

const TradeHistoryContainer = connect(
  state => ({
    tradeHistory: getAssetPairTradeHistory(state)
  })
)(TradeHistory)

const connector = connect(
  (state, ownProps) => ({
    market: getMarket(ownProps.match.params, state),
    chartInterval: getActivePriceChartInterval(state),
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
    width: '100%',
    '@media (max-width: 800px)': {
      flexDirection: 'column'
    }
  },
  wallet: {
    width: 300,
    paddingRight: 2,
    overflowY: 'auto'
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    width: 300,
    marginLeft: 0,
    paddingLeft: 2,
    paddingRight: 4,
    overflowY: 'auto'
  },
  panel: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: 0,
    marginLeft: 0
  },
  chart: {
    marginLeft: 4,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: 0
  }
})

class TradePage extends React.Component<any> {
  state = {
    value: 0
  }

  handleChange = (e, value) => {
    this.setState({ value })
  }

  render () {
    const { classes, chartInterval, account } = this.props
    const { value } = this.state

    return (
      <Layout contentClassName={classes.root}>
        <MessageListenerContainer />
        <div className={classes.wallet}>
          <Wallet />
        </div>
        <div className={classes.left}>
          <Marketplace />
          <LimitOrderPanel />
          {account &&
            <MarketplaceAllowances />
          }
        </div>
        <Panel className={classes.panel}>
          <Tabs onChange={this.handleChange} value={value}>
            <StyledTab label='Orderbook' />
            <StyledTab label='Trade History' />
          </Tabs>
          { value === 0 && <Orderbook /> }
          { value === 1 && <TradeHistoryContainer /> }
        </Panel>
        <Panel className={classes.chart}>
          <PriceChart chartInterval={chartInterval}/>
        </Panel>
      </Layout>
    )
  }
}

export default (compose as any)(
  withRouter,
  connector,
  routerListener({
    async onEnter (params, dispatch, ownProps) {
      await dispatch(loadOrderbook(params))
      await dispatch(loadAssetPairTradeHistory(params))
      const now = Math.round((new Date()).getTime() / 1000)
      await dispatch(loadMarketCandles(
        ownProps.market,
        now - ownProps.chartInterval.intervalSeconds,
        now,
        ownProps.chartInterval.groupIntervalSeconds
      ))
    }
  } as any),
  decorate
)(TradePage)
