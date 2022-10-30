export const filterKeyValObject = (keys, obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)))
}
