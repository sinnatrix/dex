import React from 'react'
import jss from 'react-jss'
import EtherscanLink from 'components/EtherscanLink'
import { connect } from 'react-redux'
import { setAccount, setNetwork, loadTokens } from 'modules/index'
import withWeb3 from 'hocs/withWeb3'

const networkNamesByIds = {
  42: 'kovan'
}

const connector = connect(
  state => ({
    network: state.network,
    account: state.account
  }),
  { setAccount, setNetwork, loadTokens }
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
  timeout

  async componentDidMount () {
    if (this.props.web3) {
      this.updateAccountDataWithTimeout()
    }

    this.props.loadTokens()
  }

  componentWillUnmount () {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  updateAccountDataWithTimeout = async () => {
    try {
      await this.updateAccountData()
    } catch (e) {
    }

    this.timeout = setTimeout(this.updateAccountDataWithTimeout, 100)
  }

  updateAccountData = async () => {
    const { web3 } = this.props
    const accounts = await web3.eth.getAccounts()
    const account = (accounts[0] || '').toLowerCase()
    const networkId = await web3.eth.net.getId()
    const network = networkNamesByIds[networkId]

    if (account !== this.props.account) {
      this.props.setAccount(account)
    }

    if (network !== this.props.network) {
      this.props.setNetwork(network)
    }
  }

  render () {
    const { account, network, classes } = this.props

    if (!account) {
      return (
        <div className={classes.error}>
          <a target='_blank' href='https://metamask.io/' rel='noopener noreferrer' style={{ marginRight: 5 }}>Metamask</a>
          account is not connected
        </div>
      )
    }

    return (
      <div className={classes.root}>
        <EtherscanLink address={account} network={network}>{account}</EtherscanLink>
      </div>
    )
  }
}

export default withWeb3(connector(decorate(ConnectionWidget)))
