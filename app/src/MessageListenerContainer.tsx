import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addMessageListener } from 'modules/subscriptions'

const connector = connect(
  null,
  { addMessageListener }
)

class MessageListenerContainer extends React.Component<any> {
  componentDidMount () {
    this.props.addMessageListener(() => this.props.match.params)
  }

  render () {
    return null
  }
}

export default withRouter(connector(MessageListenerContainer))
