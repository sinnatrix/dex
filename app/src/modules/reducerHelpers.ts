import filter from 'ramda/es/filter'
import indexBy from 'ramda/es/indexBy'
import mergeRight from 'ramda/es/mergeRight'
import uniq from 'ramda/es/uniq'

export const mergeItemsReducer = ({ state, getId, entityStoreKey, itemsList, listType }) => ({
  ...state,
  [entityStoreKey]: mergeRight(state[entityStoreKey], indexBy(getId, itemsList)),
  [listType]: uniq([
    ...itemsList.map(getId),
    ...state[listType]
  ])
})

export const removeOrphanedItemsReducer = ({ state, getId, entityStoreKey, listTypes }) => {
  const hashes = Array.prototype.concat(
    ...listTypes.map(listType => state[listType])
  )

  const nextItems = filter(one => hashes.indexOf(getId(one)) !== -1, state[entityStoreKey])

  if (nextItems.length === state[entityStoreKey].length) {
    return state
  }

  return {
    ...state,
    [entityStoreKey]: nextItems
  }
}

export const resetItemsReducer = (state, listType) => ({
  ...state,
  [listType]: []
})
