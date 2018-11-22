import React from 'react'
import jss from 'react-jss'
import Layout from 'components/Layout'
import Wallet from './components/wallet/Wallet'
import Marketplace from './components/Marketplace'
import LimitOrderPanel from './components/LimitOrderPanel'
import Orderbook from './components/orderbook/Orderbook'
import routerListener from 'hocs/routerListener'
import compose from 'ramda/es/compose'
import { loadMarketplaceToken, loadCurrentToken, loadOrderbook } from 'modules/index'

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
    marginLeft: 20,
    '@media (max-width: 800px)': {
      marginLeft: 0
    }
  }
})

const TradePage = ({ classes }) =>
  <Layout contentClassName={classes.root}>
    <div className={classes.wallet}>
      <Wallet />
    </div>
    <div className={classes.left}>
      <Marketplace />
      <LimitOrderPanel />
    </div>
    <div className={classes.right}>
      <Orderbook />
    </div>
  </Layout>

export default compose(
  routerListener({
    onEnter (params, dispatch, ownProps) {
      Promise.all([
        dispatch(loadMarketplaceToken(params.marketplace)),
        dispatch(loadCurrentToken(params.token))
      ]).then(() => {
        dispatch(loadOrderbook())
      })
    }
  }),
  decorate
)(TradePage)
