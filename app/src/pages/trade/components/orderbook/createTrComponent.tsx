import React from 'react'
import cx from 'classnames'
import { ReactTableDefaults } from 'react-table'
import SpreadRow from './SpreadRow'
import OrderRow from './OrderRow/OrderRow'

const createTrComponent = () =>
  ({ spread, className, highlightClassName, ...props }) => {
    if (spread) {
      return <SpreadRow spread={spread} />
    }

    if (!props.data) {
      return (
        <ReactTableDefaults.TrComponent {...props} />
      )
    }

    return (
      <OrderRow
        {...props}
        className={cx(className, highlightClassName)}
      />
    )
  }

export default createTrComponent
