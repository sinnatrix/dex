import React from 'react'
import cx from 'classnames'
import SpreadRow from './SpreadRow'

const createTrComponent = DefaultRowComponent =>
  ({ spread, className, highlightClassName, ...props }) => {
    if (spread) {
      return <SpreadRow spread={spread} />
    }
    return (
      <DefaultRowComponent
        {...props}
        className={cx(className, highlightClassName)}
      />
    )
  }

export default createTrComponent
