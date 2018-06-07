import React from 'react'
import jss from 'react-jss'
import Layout from 'components/Layout'
import Wallet from './components/Wallet'
import Marketplace from './components/Marketplace'
import LimitOrderForm from './components/LimitOrderForm'
import Orderbook from './components/Orderbook'

const decorate = jss({
  root: {
    display: 'flex',
    width: '100%',
    '@media (max-width: 800px)': {
      flexDirection: 'column'
    }
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 250
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

const TradePage = ({classes}) =>
  <Layout contentClassName={classes.root}>
    <div className={classes.left}>
      <Wallet />
      <Marketplace />
      <LimitOrderForm />
    </div>
    <div className={classes.right}>
      <Orderbook />
    </div>
  </Layout>

export default decorate(TradePage)
