import React from 'react'
import jss from 'react-jss'

const decorate = jss({
  root: {
    marginLeft: 30
  }
})

class Balance extends React.Component {
  state = {
    loaded: false,
    balance: 0
  }
  componentDidMount () {
    window.web3js.eth.getBalance(this.props.address, (err, balance) => {
      if (err) {
        console.error(err)
        return
      }

      const eth = balance / Math.pow(10, 18)

      this.setState({
        loaded: true,
        balance: eth
      })
    })
  }

  render () {
    const {loaded, balance} = this.state
    if (!loaded) {
      return null
    }
    const {classes} = this.props
    return (
      <div className={classes.root}>{balance} ETH</div>
    )
  }
}

export default decorate(Balance)
