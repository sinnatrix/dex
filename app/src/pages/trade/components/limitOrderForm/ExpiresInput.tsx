import React from 'react'
import jss from 'react-jss'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'

const SECONDS_IN_MINUTE = 60
const MINUTES_IN_HOUR = 60
const HOURS_IN_DAY = 24
const DAYS_IN_MONTH = 30

const unitTypes = [
  'minute',
  'hour',
  'day',
  'month'
]

const factor = unit => {
  if (unit === 'minute') {
    return SECONDS_IN_MINUTE
  }
  if (unit === 'hour') {
    return SECONDS_IN_MINUTE * MINUTES_IN_HOUR
  }
  if (unit === 'day') {
    return SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY
  }
  if (unit === 'month') {
    return SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY * DAYS_IN_MONTH
  }

  throw new Error('Wrong unit value!')
}

const decorate = jss({
  root: {
    marginTop: 10
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  value: {
    width: 50
  },
  units: {
    flex: 1,
    marginLeft: 20
  },
  labelContainer: {
    position: 'relative',
    display: 'flex'
  }
})

class ExpiresInput extends React.Component<any> {
  state = {
    unit: 'day'
  }

  handleUnitsChange = e => {
    const { onChange, value } = this.props

    const unit = e.target.value

    const nextValue = value * factor(unit) / factor(this.state.unit)

    this.setState({
      unit
    })

    onChange(nextValue)
  }

  handleChange = e => {
    const value = e.target.value

    if (isNaN(value)) {
      return
    }

    const nextValue = value === '' ? null : Math.floor(value) * factor(this.state.unit)

    this.props.onChange(nextValue)
  }

  render () {
    const { unit } = this.state
    const { classes, value } = this.props

    const inputValue = value === null ? '' : value / factor(unit)

    return (
      <div className={classes.root}>
        <div className={classes.labelContainer}>
          <InputLabel shrink>Expires</InputLabel>
        </div>
        <div className={classes.bottom}>
          <TextField
            value={inputValue}
            onChange={this.handleChange}
            className={classes.value}
          />

          <Select
            value={unit}
            className={classes.units}
            onChange={this.handleUnitsChange}
          >
            {unitTypes.map(unitType =>
              <MenuItem value={unitType} key={unitType}>
                {inputValue === 1 ? unitType : `${unitType}s`}
              </MenuItem>
            )}
          </Select>
        </div>
      </div>
    )
  }
}

export default decorate(ExpiresInput)
