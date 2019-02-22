import React from 'react'
import jss from 'react-jss'
import cx from 'classnames'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import { getEtherscanUrl } from 'modules/global/helpers'

const decorate = jss({
  root: {
    display: 'flex',
    fontSize: 12
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
      href={getEtherscanUrl(type, address, network)}
    >
      <span className={classes.content}>{children}</span>&nbsp;({network ? network.name : ''})
    </Button>
  )
}

export default decorate(EtherscanLink)
