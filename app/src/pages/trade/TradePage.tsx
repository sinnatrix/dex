import React from 'react'
import jss from 'react-jss'
import Layout from 'components/Layout'
import Wallet from './components/wallet/Wallet'
import Marketplace from './components/Marketplace'
import LimitOrderPanel from './components/LimitOrderPanel'
import Orderbook from './components/orderbook/Orderbook'
import routerListener from 'hocs/routerListener'
import compose from 'ramda/es/compose'
import { loadMarketplaceToken, loadCurrentToken } from 'modules/global'
import { loadOrderbook } from 'modules/orders'
import { loadAssetPairTradeHistory } from 'modules/tradeHistory'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Panel from 'components/Panel'
import connect from 'react-redux/es/connect/connect'
import TradeHistory from './components/wallet/TradeHistory'
import { getAssetPairTradeHistory } from 'modules/tradeHistory/selectors'

const TradeHistoryContainer = connect(
  state => ({
    tradeHistory: getAssetPairTradeHistory(state)
  })
)(TradeHistory)

const StyledTab = jss({
  root: {
    minWidth: '50%'
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
    paddingRight: 5,
    overflowY: 'auto'
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 300,
    marginLeft: 20,
    paddingLeft: 5,
    paddingRight: 5,
    overflowY: 'auto'
  },
  right: {
    flex: 1,
    display: 'flex',
    width: '100%',
    marginLeft: 20,
    '@media (max-width: 800px)': {
      marginLeft: 0
    }
  },
  panel: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: 0,
    marginLeft: 25
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
    const { classes } = this.props
    const { value } = this.state

    return (
      <Layout contentClassName={classes.root}>
        <div className={classes.wallet}>
          <Wallet />
        </div>
        <div className={classes.left}>
          <Marketplace />
          <LimitOrderPanel />
        </div>
        <Panel className={classes.panel}>
          <Tabs onChange={this.handleChange} value={value}>
            <StyledTab label='Orderbook' />
            <StyledTab label='Trade History' />
          </Tabs>
          { value === 0 && <Orderbook /> }
          { value === 1 && <TradeHistoryContainer /> }
        </Panel>
      </Layout>
    )
  }
}

export default compose(
  routerListener({
    async onEnter (params, dispatch) {
      await Promise.all([
        dispatch(loadMarketplaceToken(params.marketplace)),
        dispatch(loadCurrentToken(params.token))
      ]).then(() => {
        dispatch(loadOrderbook())
        dispatch(loadAssetPairTradeHistory())
      })
    }
  } as any),
  decorate
)(TradePage)
