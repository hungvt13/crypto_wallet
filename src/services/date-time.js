import dayjs from 'dayjs'

// constants
import { DATE_FORMAT, DATE_LOCALE } from '../config/index.js'

export const getUTCDate = (date, format = DATE_FORMAT, locale = DATE_LOCALE) => {
  return dayjs.utc(date, format, locale)
}

export const getEndOf = (dateObj, unit = 'date') => {
  return dateObj.endOf(unit)
}

export const getStartOf = (dateObj, unit = 'date') => {
  return dateObj.startOf(unit)
}

export const getEpochDate = (dateObj) => {
  return dateObj.unix()
}

export const checkValidDate = (dateStr) => {
  return dayjs(dateStr).isValid()
}
