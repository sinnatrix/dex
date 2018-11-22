import React from 'react'
import jss from 'react-jss'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import ErrorIcon from '@material-ui/icons/Error'
import DoneIcon from '@material-ui/icons/Done'
import ProgressBehaviour from './ProgressBehaviour'

const DecoratedCircularProgress = jss({
  root: {
    flex: 'none'
  }
})(CircularProgress)

const ProgressButton = ({ children, onClick, replaceContent = false, ...rest }) =>
  <ProgressBehaviour onStart={onClick}>
    {({ loaded, loading, error, onStart }) =>
      <Button {...rest} onClick={onStart}>
        {replaceContent && (loading || loaded || error) ? null : children}
        {loading &&
          <DecoratedCircularProgress size={24} color='inherit' />
        }
        {loaded &&
          <DoneIcon size={24} />
        }
        {error &&
          <ErrorIcon />
        }
      </Button>
    }
  </ProgressBehaviour>

export default ProgressButton
