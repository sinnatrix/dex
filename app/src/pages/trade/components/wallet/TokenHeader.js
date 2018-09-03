import React from 'react'
import jss from 'react-jss'

const decorate = jss({
  root: {
    marginBottom: 5,
    display: 'flex'
  },
  symbol: {
    width: 45,
    marginRight: 30
  }
})

const TokenHeader = ({ symbol, name, classes }) => {
  return (
    <div className={classes.root}>
      <span className={classes.symbol}>{symbol}</span>
      <span className={classes.name}>{name}</span>
    </div>
  )
}

export default decorate(TokenHeader)
