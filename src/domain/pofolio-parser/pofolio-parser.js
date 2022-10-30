import { getUTCDate, getEndOf, getEpochDate, checkValidDate } from '../../services/index.js'

// constants
import { REGEX_TOKEN, REGEX_DATE, REGEX_FILE_PATH, SEPARATOR } from './constant.js'

const getTokenQuery = (arg) => {
  // remove the prefix token=
  const replaced = arg.replace(REGEX_TOKEN, '')

  if (replaced.length === 0) throw new Error('You forget to pass token value')

  return replaced.split(SEPARATOR)
}

const getDateQuery = (arg) => {
  const replaced = arg.replace(REGEX_DATE, '')

  if (checkValidDate(replaced) === false) throw new Error('Invalid date')

  return getEpochDate(getEndOf(getUTCDate(replaced)))
}

const getFilepath = (arg) => {
  const replaced = arg.replace(REGEX_FILE_PATH, '')

  if (!!replaced === false) throw new Error('You forget to pass file path')

  return replaced
}

export const queryParse = (args) => {
  let tokens = []
  let date
  let filepath

  for (const arg of args) {
    if (arg.match(REGEX_TOKEN)) {
      tokens = getTokenQuery(arg)
    }

    if (arg.match(REGEX_DATE)) {
      date = getDateQuery(arg)
    }

    if (arg.match(REGEX_FILE_PATH)) {
      filepath = getFilepath(arg)
    }
  }

  return { tokens, date, filepath }
}

export const joinTokens = (tokens) => {
  return tokens.join(',')
}
