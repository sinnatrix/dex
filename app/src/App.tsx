import React from 'react'
import Web3 from 'web3'
import CssBaseline from '@material-ui/core/CssBaseline'
import { Route, Switch, Redirect } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import theme from './theme'
import createStore from './createStore'
import BlockchainService from './services/BlockchainService'
import SocketService from './services/SocketService'
import ApiService from './services/ApiService'
import InnerApp from './InnerApp'

class App extends React.Component<any> {
  blockchainService
  socketService
  store

  constructor (props) {
    super(props)

    this.socketService = new SocketService(`ws://${window.location.host}/api/0x/v2`)

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
            <InnerApp />
          </Provider>
        </MuiThemeProvider>
      </React.Fragment>
    )
  }
}

export default App
