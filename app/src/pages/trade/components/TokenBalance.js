import React from 'react'
import jss from 'react-jss'

const decorate = jss({
  root: {
    marginLeft: 30
  }
})

const getTokenBalance = (walletAddr, tokenAddr) => {
  return new Promise((resolve, reject) => {
    const methodHex = '0x70a08231000000000000000000000000'
    window.web3js.eth.call({
      to: tokenAddr,
      data: methodHex + walletAddr.substr(2)
    }, (err, result) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }

      const wei = window.web3js.toBigNumber(result).toString()
      const tokenBalance = parseFloat(window.web3js.fromWei(wei))

      resolve(tokenBalance)
    })
  })
}

class TokenBalance extends React.Component {
  state = {
    loaded: false,
    tokenBalance: 0
  }

  async componentDidMount () {
    const wethTokenAddr = '0xd0a1e359811322d97991e03f863a0c30c2cf029c'

    const tokenBalance = await getTokenBalance(this.props.address, wethTokenAddr)

    this.setState({
      loaded: true,
      tokenBalance
    })
  }

  render () {
    const {loaded, tokenBalance} = this.state
    if (!loaded) {
      return null
    }
    const {classes} = this.props
    return (
      <div className={classes.root}>{tokenBalance.toFixed(6)}&nbsp;WETH</div>
    )
  }
}

export default decorate(TokenBalance)
