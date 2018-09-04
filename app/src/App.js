import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import OrdersPage from 'pages/orders/OrdersPage'
import TradePage from 'pages/trade/TradePage'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import theme from './theme'
import store from './store'
import { setOrderbook, addOrder } from './modules/index'
import Web3 from 'web3'
import Web3Context from './contexts/Web3Context'
import SocketContext from './contexts/SocketContext'

class App extends React.Component {
  socket

  constructor (props) {
    super(props)

    this.socket = new window.WebSocket(`ws://${window.location.host}/api/v1`)
  }

  componentDidMount () {
    this.socket.addEventListener('message', message => {
      const data = JSON.parse(message.data)
      const { type, channel, payload } = data

      if (type === 'snapshot' && channel === 'orderbook') {
        store.dispatch(setOrderbook(payload))
      }

      if (type === 'update' && channel === 'orderbook') {
        store.dispatch(addOrder(payload))
      }
    })
  }

  getWeb3 = () => {
    return new Web3(window.web3.currentProvider)
  }

  render () {
    return (
      <React.Fragment>
        <CssBaseline />
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <SocketContext.Provider value={this.socket}>
              <Web3Context.Provider value={this.getWeb3()}>
                <Router>
                  <Switch>
                    <Route exact path='/' render={() => <Redirect to='/WETH/ZRX' />} />
                    <Route path='/orders' component={OrdersPage} />
                    <Route path='/:marketplace?/:token?' component={TradePage} />
                  </Switch>
                </Router>
              </Web3Context.Provider>
            </SocketContext.Provider>
          </Provider>
        </MuiThemeProvider>
      </React.Fragment>
    )
  }
}

export default App
