import React from 'react'
import jss from 'react-jss'
import CircularProgress from '@material-ui/core/CircularProgress'
import ErrorIcon from '@material-ui/icons/Error'
import ProgressBehaviour from './ProgressBehaviour'
import Switch from '@material-ui/core/Switch'
import cx from 'classnames'

const DecoratedCircularProgress = jss({
  root: {
    flex: 'none',
    color: '#000'
  }
})(CircularProgress)

const decorate = jss({
  wrapper: {
    position: 'relative',
    '&$loading > $iconWrapper, &$error > $iconWrapper': {
      visibility: 'visible'
    },
    '&$loading > $switch, &$error > $switch': {
      opacity: 0.5
    }
  },
  loading: {},
  error: {},
  switch: {
    opacity: 1
  },
  iconWrapper: {
    visibility: 'hidden',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    '& > *': {
      position: 'relative',
      left: '30%',
      top: '15%'
    }
  }
})

class SmartToggleButton extends React.Component<any> {
  render () {
    const { classes, className, onChange, ...rest } = this.props
    return (
      <ProgressBehaviour onStart={onChange}>
        {({ loading, error, onStart }) => {
          return (
            <div className={cx(
              classes.wrapper,
              loading ? classes.loading : null,
              error ? classes.error : null
            )}>
              <Switch
                {...rest}
                onClick={onStart}
                className={cx(classes.switch, className)}
              />
              <div className={classes.iconWrapper}>
                { loading &&
                  <DecoratedCircularProgress size={24} color='inherit' />
                }
                { error &&
                  <ErrorIcon />
                }
              </div>
            </div>
          )
        }}
    </ProgressBehaviour>
    )
  }
}

export default decorate(SmartToggleButton)
