import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import OrdersPage from 'pages/orders/OrdersPage'
import TradePage from 'pages/trade/TradePage'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import theme from './theme'
import store from './store'
import {setOrderbook, addOrder} from './modules/index'
import {socket} from './ws'

class App extends React.Component {
  componentDidMount () {
    socket.addEventListener('message', message => {
      const data = JSON.parse(message.data)
      const {type, channel, payload} = data

      if (type === 'snapshot' && channel === 'orderbook') {
        store.dispatch(setOrderbook(payload))
      }

      if (type === 'update' && channel === 'orderbook') {
        store.dispatch(addOrder(payload))
      }
    })
  }

  render () {
    return (
      <React.Fragment>
        <CssBaseline />
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <Router>
              <Switch>
                <Route exact path='/' render={() => <Redirect to='/WETH/ZRX' />} />
                <Route path='/orders' component={OrdersPage} />
                <Route path='/:marketplace?/:token?' component={TradePage} />
              </Switch>
            </Router>
          </Provider>
        </MuiThemeProvider>
      </React.Fragment>
    )
  }
}

export default App
