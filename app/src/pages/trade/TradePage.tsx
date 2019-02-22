import React from 'react'
import { connect } from 'react-redux'
import jss from 'react-jss'
import { withRouter } from 'react-router'
import { Redirect } from 'react-router-dom'
import Layout from 'components/Layout'
import Wallet from './components/wallet/Wallet'
import Marketplace from './components/Marketplace'
import LimitOrderPanel from './components/LimitOrderPanel'
import Orderbook from './components/orderbook/Orderbook'
import TradeHistory from './components/tradeHistory/TradeHistory'
import PriceChartWrapper from './components/priceChart/PriceChartWrapper'
import DepthChartWrapper from './components/depthChart/DepthChartWrapper'
import MessageListenerContainer from 'MessageListenerContainer'
import routerListener from 'hocs/routerListener'
import { loadOrderbook } from 'modules/orders'
import { loadAssetPairTradeHistory } from 'modules/tradeHistory'
import { loadMarket } from 'modules/global'
import {
  getAssetPairTradeHistory,
  getAccount,
  getMarket,
  getAssetPairTradeHistoryLoaded,
  getMarketLoaded
} from 'selectors'
import compose from 'ramda/es/compose'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Panel from 'components/Panel'
import MarketplaceAllowances from './components/MarketplaceAllowances'
import { DEFAULT_MARKET_PATH } from 'modules/global/helpers'

const TradeHistoryContainer = connect(
  state => ({
    tradeHistory: getAssetPairTradeHistory(state),
    tradeHistoryLoaded: getAssetPairTradeHistoryLoaded(state)
  })
)(TradeHistory)

const connector = connect(
  (state, ownProps) => ({
    account: getAccount(state),
    market: getMarket(ownProps.match.params, state),
    marketLoaded: getMarketLoaded(state)
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
  charts: {
    marginLeft: 4,
    minWidth: 200,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: 0,
    overflowY: 'auto'
  },
  chartWrapper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minHeight: 0
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
    const { classes, chartInterval, account, market } = this.props

    const { value } = this.state

    return (
      <Layout contentClassName={classes.root}>
        {this.renderRedirect()}
        <MessageListenerContainer />
        <div className={classes.wallet}>
          <Wallet />
        </div>
        {!!market &&
          <>
            <div className={classes.left}>
              <Marketplace />
              <LimitOrderPanel />
              {!!account &&
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
            <Panel className={classes.charts}>
              <div className={classes.chartWrapper}>
                <PriceChartWrapper chartInterval={chartInterval} />
              </div>
              <div className={classes.chartWrapper}>
                <DepthChartWrapper />
              </div>
            </Panel>
          </>
        }
      </Layout>
    )
  }

  renderRedirect () {
    const {
      marketLoaded,
      market,
      match: { url }
    } = this.props

    if (!marketLoaded) {
      return null
    }

    if (market) {
      return null
    }

    if (url !== DEFAULT_MARKET_PATH) {
      return <Redirect to={DEFAULT_MARKET_PATH} />
    }
  }
}

export default (compose as any)(
  withRouter,
  connector,
  routerListener({
    async onEnter (params, dispatch) {
      await dispatch(loadMarket(params))
      await Promise.all([
        dispatch(loadOrderbook(params)),
        dispatch(loadAssetPairTradeHistory(params))
      ])
    }
  } as any),
  decorate
)(TradePage)
