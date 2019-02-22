import React from 'react'
import jss from 'react-jss'
import Panel from 'components/Panel'
import LimitOrderForm from './limitOrderForm/LimitOrderForm'

const decorate = jss({
  root: {
    position: 'relative',
    paddingBottom: 10
  },
  disabledOverlay: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: '#ccc',
    opacity: 0.5,
    left: 0,
    top: 0,
    height: '100%',
    width: '100%'
  }
})

const LimitOrderPanel = ({ classes, disabled }) => {
  return (
    <Panel className={classes.root}>
      {disabled &&
        <div className={classes.disabledOverlay} />
      }
      <LimitOrderForm />
    </Panel>
  )
}

export default decorate(LimitOrderPanel)
