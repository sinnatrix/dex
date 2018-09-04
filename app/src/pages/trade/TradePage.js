import React from 'react'
import jss from 'react-jss'
import Layout from 'components/Layout'
import Wallet from './components/wallet/Wallet'
import Marketplace from './components/Marketplace'
import OrderPanel from './components/OrderPanel'
import Orderbook from './components/orderbook/Orderbook'
import routerListener from 'hocs/routerListener'
import compose from 'ramda/es/compose'
import { loadMarketplaceToken, loadCurrentToken, loadOrderbook } from 'modules/index'
import withSocket from 'hocs/withSocket'

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
      <OrderPanel />
    </div>
    <div className={classes.right}>
      <Orderbook />
    </div>
  </Layout>

export default compose(
  withSocket,
  routerListener({
    onEnter (params, dispatch, ownProps) {
      console.log('ownProps: ', ownProps)

      Promise.all([
        dispatch(loadMarketplaceToken(params.marketplace)),
        dispatch(loadCurrentToken(params.token))
      ]).then(() => {
        dispatch(loadOrderbook(ownProps.socket))
      })
    }
  }),
  decorate
)(TradePage)
