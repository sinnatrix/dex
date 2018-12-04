import React from 'react'
import jss from 'react-jss'
import cx from 'classnames'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'

const connector = connect(
  state => ({
    network: state.global.network
  })
)

const decorate = jss({
  root: {
    display: 'flex'
  },
  content: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  label: {
    minWidth: 0
  }
})

const EtherscanLink = ({ classes, className, children, network, address, type = 'address' }) => {
  return (
    <Button
      variant='outlined'
      className={cx(classes.root, className)}
      classes={{ label: classes.label }}
      target='_blank'
      href={`https://${network}.etherscan.io/${type}/${address}`}
    >
      <span className={classes.content}>{children}</span>&nbsp;({network})
    </Button>
  )
}

export default connector(decorate(EtherscanLink))
