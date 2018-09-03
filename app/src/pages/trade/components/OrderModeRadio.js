import React from 'react'
import jss from 'react-jss'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'

const decorate = jss({
  root: {}
})

class OrderModeRadio extends React.Component {
  handleChange = e => {
    this.props.onChange(e.target.value)
  }

  render () {
    const { mode } = this.props

    return (
      <RadioGroup
        row
        aria-label='mode'
        name='mode'
        value={mode}
        onChange={this.handleChange}
      >
        <FormControlLabel value='buy' control={<Radio />} label='Buy' />
        <FormControlLabel value='sell' control={<Radio />} label='Sell' />
      </RadioGroup>
    )
  }
}

export default decorate(OrderModeRadio)
