import React from 'react'

class ProgressBehaviour extends React.Component<any> {
  state = {
    loading: false,
    loaded: false,
    error: false
  }

  handleStart = async (...args) => {
    this.setState({
      loading: true,
      loaded: false,
      error: false
    })

    try {
      await this.props.onStart(...args)
      this.setState({
        loading: false,
        loaded: true,
        error: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        loading: false,
        loaded: false,
        error: true
      })
    }

    await new Promise(resolve => {
      setTimeout(resolve, 2000)
    })

    this.setState({
      loaded: false,
      loading: false,
      error: false
    })
  }

  render () {
    const { loading, loaded, error } = this.state

    return (this.props.children as any)({
      loading,
      loaded,
      error,
      onStart: this.handleStart
    })
  }
}

export default ProgressBehaviour
