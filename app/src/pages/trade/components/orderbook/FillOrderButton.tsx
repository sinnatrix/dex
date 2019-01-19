import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import ProgressButton from 'components/ProgressButton'
import { fillOrder } from 'modules/orders'

const connector = connect(
  null,
  { fillOrder }
)

const decorate = jss({
  fillButton: {
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  }
})

class FillOrderButton extends React.Component<any> {
  handleClick = async () => {
    const { order } = this.props
    await this.props.fillOrder(order)
  }

  render () {
    const { classes } = this.props
    return (
      <ProgressButton className={classes.fillButton} onClick={this.handleClick} variant='contained' replaceContent>
        Fill
      </ProgressButton>
    )
  }
}

export default connector(decorate(FillOrderButton))
