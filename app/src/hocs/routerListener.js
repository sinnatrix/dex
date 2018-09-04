import React from 'react'
import { connect } from 'react-redux'
import compose from 'ramda/es/compose'

const makeConnector = ({ onEnter, onLeave }) => connect(
  null,
  (dispatch, ownProps) => ({
    onEnter (params) {
      if (!onEnter) {
        return
      }
      return onEnter(params, dispatch, ownProps)
    },
    onLeave (params) {
      if (!onLeave) {
        return
      }
      return onLeave(params, dispatch, ownProps)
    }
  })
)

const wrap = WrappedComponent => {
  return class extends React.Component {
    componentDidMount () {
      this.props.onEnter(this.props.match.params)
    }

    componentDidUpdate (prevProps) {
      const isChanged = Object.keys(this.props.match.params).some(key => {
        return this.props.match.params[key] !== prevProps.match.params[key]
      })

      if (isChanged) {
        this.props.onEnter(this.props.match.params)
      }
    }

    componentWillUnmount () {
      this.props.onLeave(this.props.match.params)
    }

    render () {
      return <WrappedComponent {...this.props} />
    }
  }
}

export default ({ onEnter, onLeave }) => WrappedComponent =>
  compose(
    makeConnector({ onEnter, onLeave }),
    wrap
  )(WrappedComponent)
