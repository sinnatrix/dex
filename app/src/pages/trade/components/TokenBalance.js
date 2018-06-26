import React from 'react'
import jss from 'react-jss'

const decorate = jss({
  root: {
    marginLeft: 30
  }
})

const methodHex = '0x70a08231000000000000000000000000'
const tokenAddr = '0xd0a1e359811322d97991e03f863a0c30c2cf029c'

class TokenBalance extends React.Component {
  state = {
    loaded: false,
    tokenBalance: 0
  }

  componentDidMount () {
    window.web3js.eth.call({
      to: tokenAddr,
      data: methodHex + this.props.address.substr(2)
    }, (err, result) => {
      if (err) {
        console.error(err)
        return
      }

      const wei = window.web3js.toBigNumber(result).toString()
      const tokenBalance = parseFloat(window.web3js.fromWei(wei))

      this.setState({
        loaded: true,
        tokenBalance
      })
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
