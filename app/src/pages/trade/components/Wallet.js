import React from 'react'
import jss from 'react-jss'
import Web3 from 'web3'
import Panel from 'components/Panel'
import EtherscanLink from 'components/EtherscanLink'
import Balance from './EthBalance'
import TokenBalance from './TokenBalance'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {setAccount, setNetwork} from 'modules/index'

const networkNamesByIds = {
  42: 'kovan'
}

const connector = connect(
  state => ({
    account: state.account,
    network: state.network
  }),
  dispatch => bindActionCreators({setAccount, setNetwork}, dispatch)
)

const decorate = jss({
  root: {
    display: 'flex',
    alignItems: 'left',
    flex: 'none',
    flexDirection: 'column'
  }
})

class Wallet extends React.Component {
  web3js
  internal

  componentDidMount () {
    if (window.web3) {
      this.web3js = new Web3(window.web3.currentProvider)
      window.web3js = this.web3js

      this.interval = setInterval(() => {
        this.updateAccountData()
      }, 100)
    }
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
    const {classes, account, network} = this.props

    if (!account) {
      return <Panel>Account not connected</Panel>
    }

    return (
      <Panel className={classes.root}>
        <EtherscanLink address={account} network={network}>{account}</EtherscanLink>

        <Balance />
        <TokenBalance token={{
          address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
          symbol: 'WETH'
        }} />
      </Panel>
    )
  }
}

export default connector(decorate(Wallet))
