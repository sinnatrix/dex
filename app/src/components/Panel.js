import React from 'react'
import jss from 'react-jss'
import Paper from '@material-ui/core/Paper'
import cx from 'classnames'

const decorate = jss(theme => ({
  root: theme.mixins.gutters({
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: theme.spacing.unit * 2
  })
}))

const Panel = ({ classes, className, children }) => {
  return (
    <Paper className={cx(classes.root, className)}>{children}</Paper>
  )
}

export default decorate(Panel)
