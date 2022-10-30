export const validateDate = (datetime) => {
  return (new Date(datetime).getTime() > 0)
}

export const validateType = (availableTypes, targetType) => {
  return availableTypes.includes(targetType)
}

export const validateTokenName = (token) => {
  // regex to match 3 capitalized alphabetic letters
  const regex = /^[A-Z]{3}$/

  return regex.test(token)
}
export const validateTokenAmount = (amountStr) => {
  // regex to match a demical string
  const regex = /^\d*\.?\d*$/

  return regex.test(amountStr)
}
