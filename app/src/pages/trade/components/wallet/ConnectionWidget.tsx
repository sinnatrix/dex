import React from 'react'
import jss from 'react-jss'
import EtherscanLink from 'components/EtherscanLink'
import { connect } from 'react-redux'
import { loadTokens, updateAccountData, makeConnectRequest } from 'modules/global'

const connector = connect(
  state => ({
    network: state.global.network,
    account: state.global.account
  }),
  { loadTokens, updateAccountData, makeConnectRequest }
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

class ConnectionWidget extends React.Component<any> {
  timeout

  async componentDidMount () {
    await this.props.makeConnectRequest()
    await this.updateAccountDataWithTimeout()
    await this.props.loadTokens()
  }

  componentWillUnmount () {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  updateAccountDataWithTimeout = async () => {
    try {
      await this.props.updateAccountData()
    } catch (e) {
      console.log('updateAccountData error', e)
    }

    this.timeout = setTimeout(this.updateAccountDataWithTimeout, 100)
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

export default connector(decorate(ConnectionWidget))
