import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import OrdersPage from 'pages/orders/OrdersPage'
import TradePage from 'pages/trade/TradePage'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import theme from './theme'
import createStore from './createStore'
import { processSocketMessage } from 'modules/subscriptions'
import BlockchainService from './services/BlockchainService'
import Web3 from 'web3'

class App extends React.Component {
  socket
  blockchainService
  store

  constructor (props) {
    super(props)

    this.socket = new window.WebSocket(`ws://${window.location.host}/api/relayer/v2`)
    this.blockchainService = this.createBlockchainService()

    this.store = createStore({
      socket: this.socket,
      blockchainService: this.blockchainService
    })
  }

  createBlockchainService () {
    const web3 = new Web3(window.ethereum)
    return new BlockchainService({
      web3,
      contractAddresses: null
    })
  }

  async componentDidMount () {
    this.socket.addEventListener('message', message => {
      this.store.dispatch(processSocketMessage(message))
    })

    await this.blockchainService.init()
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
