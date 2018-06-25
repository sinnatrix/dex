import React from 'react'
import jss from 'react-jss'
import Button from '@material-ui/core/Button'

const decorate = jss({
  root: {
    display: 'flex'
  },
  content: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
})

const EtherscanLink = ({classes, children, network, address}) => {
  return (
    <Button
      variant='outlined'
      className={classes.root}
      target='_blank'
      href={`https://${network}.etherscan.io/address/${address}`}
    >
      <span className={classes.content}>{children}</span>&nbsp;({network})
    </Button>
  )
}

export default decorate(EtherscanLink)
