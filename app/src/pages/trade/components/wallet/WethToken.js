import React from 'react'
import jss from 'react-jss'
import Token from './Token'
import UnwrapWethForm from './UnwrapWethForm'

const decorate = jss({
  root: {}
})

class WethToken extends React.Component {
  render () {
    const { classes, token } = this.props
    return (
      <div className={classes.root}>
        <Token token={token} />
        <UnwrapWethForm />
      </div>
    )
  }
}

export default decorate(WethToken)
