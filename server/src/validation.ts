export const validateRequiredField = (field, value) => {
  if (value) {
    return null
  }

  return {
    field,
    code: 1000,
    reason: `${field} parameter is missing`
  }
}

export const validateNetworkId = (value, currentNetworkId) => {
  if (!value) {
    return null
  }

  if (value !== currentNetworkId) {
    return {
      field: 'networkId',
      code: 1006,
      reason: `Current network id is fixed to ${currentNetworkId} and not allowed to change`
    }
  }

  return null
}
