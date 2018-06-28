import React from 'react'
import jss from 'react-jss'
import Web3 from 'web3'
import Panel from 'components/Panel'
import EtherscanLink from 'components/EtherscanLink'
import EthToken from './EthToken'
import Token from './Token'
import WethToken from './WethToken'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {setAccount, setNetwork, loadTokens} from 'modules/index'

const networkNamesByIds = {
  42: 'kovan'
}

const connector = connect(
  state => ({
    account: state.account,
    network: state.network,
    tokens: state.tokens
  }),
  dispatch => bindActionCreators({setAccount, setNetwork, loadTokens}, dispatch)
)

const decorate = jss({
  root: {
    display: 'flex',
    alignItems: 'left',
    flex: 'none',
    flexDirection: 'column',
    padding: 0
  },
  token: {
    borderTop: '1px solid #ccc',
    padding: [[12, 24]]
  },
  connectionWidget: {
    padding: [[12, 24]]
  }
})

class Wallet extends React.Component {
  web3js
  internal

  async componentDidMount () {
    if (window.web3) {
      this.web3js = new Web3(window.web3.currentProvider)
      window.web3js = this.web3js

      this.interval = setInterval(() => {
        this.updateAccountData()
      }, 100)
    }

    this.props.loadTokens()
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  updateAccountData = () => {
    const account = this.web3js.eth.accounts[0]
    const networkId = this.web3js.version.network
    const network = networkNamesByIds[networkId]

    if (account !== this.props.account) {
      this.props.setAccount(account)
    }

    if (network !== this.props.network) {
      this.props.setNetwork(network)
    }
  }

  render () {
    const {classes, account, network, tokens} = this.props

    if (!account) {
      return <Panel>Account not connected</Panel>
    }

    const wethToken = tokens.find(one => one.symbol === 'WETH')

    return (
      <Panel className={classes.root}>
        <div className={classes.connectionWidget}>
          <EtherscanLink address={account} network={network}>{account}</EtherscanLink>
        </div>

        <div className={classes.token}>
          <EthToken />
        </div>

        <div className={classes.token}>
          <WethToken token={wethToken} />
        </div>

        {tokens.filter(token => token.symbol !== 'WETH').map(token =>
          <div key={token.address} className={classes.token}>
            <Token token={token} />
          </div>
        )}
      </Panel>
    )
  }
}

export default connector(decorate(Wallet))
