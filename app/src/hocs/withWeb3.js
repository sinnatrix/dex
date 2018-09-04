import React from 'react'
import Web3Context from '../contexts/Web3Context'

const withWeb3 = WrappedComponent => {
  return props => (
    <Web3Context.Consumer>
      {web3 =>
        <WrappedComponent {...props} web3={web3} />
      }
    </Web3Context.Consumer>
  )
}

export default withWeb3
