import React from 'react'
import jss from 'react-jss'
import Web3 from 'web3'
import Panel from 'components/Panel'
import EtherscanLink from 'components/EtherscanLink'
import Balance from './Balance'

const networkNamesByIds = {
  42: 'kovan'
}

const decorate = jss({
  root: {
    display: 'flex',
    alignItems: 'center'
  }
})

class Wallet extends React.Component {
  web3js
  state = {
    account: '',
    network: ''
  }

  componentDidMount () {
    if (window.web3) {
      this.web3js = new Web3(window.web3.currentProvider)
      window.web3js = this.web3js

      const account = this.web3js.eth.accounts[0]
      const networkId = this.web3js.version.network
      const network = networkNamesByIds[networkId]

      this.setState({
        account,
        network
      })
    }
  }

  render () {
    const {classes} = this.props
    const {account, network} = this.state

    if (!account) {
      return <Panel>Account not connected</Panel>
    }

    return (
      <Panel className={classes.root}>
        <EtherscanLink address={account} network={network}>{account} ({network})</EtherscanLink>
        <Balance address={account} />
      </Panel>
    )
  }
}

export default decorate(Wallet)
