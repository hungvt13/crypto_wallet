import { getMultiPrice } from '../../api/external/crypto-compare/crypto-compare-api.js'
import { validateDate, validateType, validateTokenName, validateTokenAmount } from '../../services/data-validator.js'

import { TYPE_CURRENCY } from '../../config/index.js'
import { TRANSACTION_TYPE } from './constant.js'

const portfolio = {}

const validate = (line, lineCount) => {
  const [date, transactionType, token, amount, ...restItem] = line.split(',')

  // incorrect csv data
  if (restItem.length > 0) throw new Error(`line #${lineCount}: CSV data is incorrect`)

  // assuming date is sorted descend correctly
  if (!validateDate(parseInt(date))) throw new Error(`line #${lineCount}: CSV date is incorrect`)
  if (!validateType(Object.values(TRANSACTION_TYPE), transactionType)) throw new Error(`line #${lineCount}: CSV transaction_type is incorrect`)
  if (!validateTokenName(token)) throw new Error(`line #${lineCount}: CSV token is incorrect`)
  if (!validateTokenAmount(amount)) throw new Error(`line #${lineCount}: CSV amount is incorrect`)

  return true
}

/**
 *
 * @param {Array} line
 * @param {Array} targetTokens
 * @param {Number} targetDate epoch datetime
 * @returns
 */
const accumulateData = (line, targetTokens, targetDate) => {
  const [date, transactionType, token, amount] = line.split(',')

  // skip data that not matched criteria
  if (targetTokens?.length && !targetTokens.includes(token)) return false
  if (targetDate && targetDate < parseInt(date)) return false

  const parsedAmount = parseFloat(amount)

  if (transactionType === TRANSACTION_TYPE.DEPOSIT) {
    portfolio[token] = (portfolio[token] || 0) + parsedAmount
  } else {
    portfolio[token] = (portfolio[token] || 0) - parsedAmount
  }

  return false
}

export const accumulate = (line, lineCount, targetTokens, targetDate) => {
  validate(line, lineCount)

  return accumulateData(line, targetTokens, targetDate)
}

export const getRawPorfolio = () => {
  return portfolio
}

export const buildPorfolio = async (rawPorfolio, tokens) => {
  const results = await getMultiPrice(tokens, TYPE_CURRENCY)
  const tokenKeys = Object.keys(rawPorfolio)

  return tokenKeys.reduce((acc, key) => {
    acc[key] = {
      total: rawPorfolio[key],
      amount: results[key][TYPE_CURRENCY]
    }

    return acc
  }, {})
}
