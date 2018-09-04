import React from 'react'
import SocketContext from '../contexts/SocketContext'

const withSocket = WrappedComponent => {
  return props => (
    <SocketContext.Consumer>
      {socket =>
        <WrappedComponent {...props} socket={socket} />
      }
    </SocketContext.Consumer>
  )
}

export default withSocket
