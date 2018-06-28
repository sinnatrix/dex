import React from 'react'
import jss from 'react-jss'
import EtherscanLink from 'components/EtherscanLink'
import Web3 from 'web3'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {setAccount, setNetwork, loadTokens} from 'modules/index'

const networkNamesByIds = {
  42: 'kovan'
}

const connector = connect(
  state => ({
    network: state.network,
    account: state.account
  }),
  dispatch => bindActionCreators({setAccount, setNetwork, loadTokens}, dispatch)
)

const decorate = jss({
  root: {
    padding: [[12, 8]]
  },
  error: {
    padding: [[12, 24]],
    textAlign: 'center'
  }
})

class ConnectionWidget extends React.Component {
  interval

  async componentDidMount () {
    if (window.web3) {
      window.web3js = new Web3(window.web3.currentProvider)

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
    const account = window.web3js.eth.accounts[0]
    const networkId = window.web3js.version.network
    const network = networkNamesByIds[networkId]

    if (account !== this.props.account) {
      this.props.setAccount(account)
    }

    if (network !== this.props.network) {
      this.props.setNetwork(network)
    }
  }
  render () {
    const {account, network, classes} = this.props

    if (!account) {
      return (
        <div className={classes.error}><a target='_blank' href='https://metamask.io/'>Metamask</a> account is not connected</div>
      )
    }

    return (
      <div className={classes.root}>
        <EtherscanLink address={account} network={network}>{account}</EtherscanLink>
      </div>
    )
  }
}

export default connector(decorate(ConnectionWidget))
