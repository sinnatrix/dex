import React from 'react'
import jss from 'react-jss'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'

const decorate = jss(theme => ({
  root: {},
  bidColor: {
    color: [theme.custom.bidColor.main, '!important']
  },
  askColor: {
    color: [theme.custom.askColor.main, '!important']
  }
}))

class OrderModeRadio extends React.Component<any> {
  handleChange = e => {
    this.props.onChange(e.target.value)
  }

  render () {
    const { mode, classes } = this.props


    return (
      <RadioGroup
        row
        aria-label='mode'
        name='mode'
        value={mode}
        onChange={this.handleChange}
      >
        <FormControlLabel
          value='buy'
          control={<Radio className={classes.askColor} />}
          label='Buy'
        />
        <FormControlLabel
          value='sell'
          control={<Radio className={classes.bidColor} />}
          label='Sell'
        />
      </RadioGroup>
    )
  }
}

export default decorate(OrderModeRadio)
