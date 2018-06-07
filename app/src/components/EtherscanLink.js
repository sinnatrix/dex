import React from 'react'
import jss from 'react-jss'
import Button from '@material-ui/core/Button'

const decorate = jss({
  root: {
  }
})

const EtherscanLink = ({classes, children, network, address}) => {
  return (
    <Button
      variant='outlined'
      className={classes.root}
      target='_blank'
      href={`https://${network}.etherscan.io/address/${address}`}
    >{children}</Button>
  )
}

export default decorate(EtherscanLink)
