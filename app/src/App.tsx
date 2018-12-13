import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import TradePage from 'pages/trade/TradePage'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import theme from './theme'
import createStore from './createStore'
import { processSocketMessage } from 'modules/subscriptions'
import BlockchainService from './services/BlockchainService'
import SocketService from './services/SocketService'
import ApiService from './services/ApiService'
import Web3 from 'web3'

class App extends React.Component<any> {
  blockchainService
  socketService
  store

  constructor (props) {
    super(props)

    this.socketService = new SocketService(`ws://${window.location.host}/api/relayer/v2`)
    this.socketService.addMessageListener(message => {
      this.store.dispatch(processSocketMessage(message))
    })

    this.blockchainService = this.createBlockchainService()

    this.store = createStore({
      socketService: this.socketService,
      blockchainService: this.blockchainService,
      apiService: new ApiService()
    })
  }

  createBlockchainService () {
    const web3 = new Web3((window as any).ethereum)
    return new BlockchainService({
      web3,
      contractAddresses: null
    })
  }

  async componentDidMount () {
    await this.blockchainService.init()
    await this.socketService.init()
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
