import React from 'react'
import jss from 'react-jss'
import { Route } from 'react-router-dom'
import Layout from 'components/Layout'
import Order from './components/Order'
import OrdersList from './components/OrdersList'

const decorate = jss({
  root: {
    display: 'flex',
    marginTop: 35
  }
})

const OrdersPage = ({ classes }) => {
  return (
    <Layout>
      <div className={classes.root}>
        <OrdersList />
        <Route path='/orders/:hash' component={Order} />
      </div>
    </Layout>
  )
}

export default decorate(OrdersPage)
