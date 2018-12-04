import React from 'react'
import jss from 'react-jss'

const decorate = jss({
  root: {
    height: 34,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'darkgrey',
    color: 'white'
  }
})

const SpreadRow = ({ classes, spread }) => {
  return (
    <div className={classes.root} id='orderbook-spread'>
      Spread: {spread.value.toFixed(6)}
    </div>
  )
}

export default decorate(SpreadRow)
