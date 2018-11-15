import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import OrdersPage from 'pages/orders/OrdersPage'
import TradePage from 'pages/trade/TradePage'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import theme from './theme'
import createStore from './createStore'
import { addOrders } from './modules/index'
import Web3 from 'web3'

class App extends React.Component {
  store
  socket

  constructor (props) {
    super(props)

    this.socket = new window.WebSocket(`ws://${window.location.host}/api/relayer/v2`)
    const web3 = new Web3(window.web3.currentProvider)

    this.store = createStore({
      socket: this.socket,
      web3
    })
  }

  componentDidMount () {
    this.socket.addEventListener('message', message => {
      const data = JSON.parse(message.data)
      const { type, channel, payload: orders } = data

      if (type === 'update' && channel === 'orders') {
        this.store.dispatch(addOrders(orders))
      }
    })
  }

  render () {
    return (
      <React.Fragment>
        <CssBaseline />
        <MuiThemeProvider theme={theme}>
          <Provider store={this.store}>
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
