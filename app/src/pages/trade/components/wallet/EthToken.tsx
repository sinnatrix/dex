import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { loadEthBalance } from 'modules/global'
import WrapEthForm from './WrapEthForm'
import TokenHeader from './TokenHeader'
import { getEthBalance } from 'selectors'

const connector = connect(
  state => ({
    ethBalance: getEthBalance(state)
  }),
  { loadEthBalance }
)

const decorate = jss({
  root: {
    fontSize: 14
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    height: 32
  }
})

class EthToken extends React.Component<any> {
  componentDidMount (): void {
    this.props.loadEthBalance()
  }

  render () {
    const { classes, ethBalance } = this.props
    return (
      <div className={classes.root}>
        <TokenHeader symbol='ETH' name='Ethereum' />
        <div className={classes.content}>
          <span>{ethBalance.toFixed(7) || 0}</span>
        </div>
        <WrapEthForm />
      </div>
    )
  }
}

export default connector(decorate(EthToken))
