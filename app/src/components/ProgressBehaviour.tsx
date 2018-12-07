import React from 'react'

class ProgressBehaviour extends React.Component<any> {
  mounted

  state = {
    loading: false,
    loaded: false,
    error: false
  }

  componentDidMount () {
    this.mounted = true
  }

  componentWillUnmount () {
    this.mounted = false
  }

  setStateIfMounted (value) {
    if (this.mounted) {
      this.setState(value)
    }
  }

  handleStart = async (...args) => {
    this.setStateIfMounted({
      loading: true,
      loaded: false,
      error: false
    })

    try {
      await this.props.onStart(...args)
      this.setStateIfMounted({
        loading: false,
        loaded: true,
        error: false
      })
    } catch (e) {
      console.error(e)
      this.setStateIfMounted({
        loading: false,
        loaded: false,
        error: true
      })
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    this.setStateIfMounted({
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
