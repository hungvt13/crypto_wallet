/**
 * simulate caching
 *
 * cache by X day(s)
 */

import { writeFileStream, readFile } from './file.js'
import { getUTCDate, getEndOf, getEpochDate } from './date-time.js'
import { filterKeyValObject } from '../utils/index.js'

import { TRANSACTION_TYPE } from '../domain/portfolio/constant.js'
import { CACHE_DAYS } from '../config/index.js'

let startDate = null
let endDate = null
let latestDate = null
let firstDate = null
let isNext = false
const allData = []
let changes = {}

// assuming: the conversion rate is the same as today rate

const appendData = (date, data) => {
  allData.push({
    date,
    readabledate: new Date(date).toUTCString(),
    changes: { ...data }
  })

  return allData
}

export const appendLastData = (date = startDate, data = changes) => {
  appendData(date, data)
}

export const getAllData = () => {
  return allData
}

export const cache = (line) => {
  const [date, transactionType, token, amount] = line.split(',')
  const parsedDate = new Date(parseInt(date) * 1000)
  const epochParsedDate = getEpochDate(getEndOf(getUTCDate(parsedDate, null, null)))

  if (startDate === null) {
    startDate = epochParsedDate
  }

  if (endDate === null) {
    const normalDate = new Date(startDate * 1000)
    endDate = getEpochDate(getUTCDate(normalDate, null, null).subtract(CACHE_DAYS, 'day'))
  }

  if (epochParsedDate < endDate) {
    isNext = true
  }

  if (isNext) {
    appendData(startDate, changes)
    // reset states
    isNext = false
    startDate = epochParsedDate
    endDate = null
    changes = {}
  }

  const parsedAmount = parseFloat(amount)

  if (transactionType === TRANSACTION_TYPE.DEPOSIT) {
    changes[token] = (changes[token] || 0) + parsedAmount
  } else if (transactionType === TRANSACTION_TYPE.WITHDRAWAL) {
    changes[token] = (changes[token] || 0) - parsedAmount
  }

  // remember the first & last date in file
  if (latestDate === null) latestDate = epochParsedDate
  firstDate = epochParsedDate
}

/**
 *
 * @param {Object} todayBalance
 * @param {Array} todayTokens
 * @param {Array} changes
 */
const calculateBalance = (todayBalance, todayTokens, changes) => {
  todayTokens.forEach((token) => {
    const { [token]: tokenChanges = 0 } = changes
    todayBalance[token] -= tokenChanges
  })

  return { ...todayBalance }
}

const buildBalance = (data, porfolio) => {
  const tokens = Object.keys(porfolio)
  const copiedPortfolio = { ...porfolio } // not mess with original data

  const balancePerPeriod = data.reduce((acc, { date, changes }, index) => {
    if (index === 0) { // latest date = current balance
      acc[date] = porfolio
    }

    /**
     * since the balance of previous date = today balance - today changes
     *
     * and the last date will not be available so create a date prev to it
     */
    const prev = new Date(parseInt(date) * 1000)
    const prevEpoch = getEpochDate(getUTCDate(prev, null, null).subtract(CACHE_DAYS, 'day'))

    const nextDate = data[index + 1]?.date || prevEpoch

    acc[nextDate] = calculateBalance(
      copiedPortfolio,
      tokens,
      changes
    )

    return acc
  }, {})

  return balancePerPeriod
}

export const getCacheConfigs = () => {
  const fileName = 'cache.json'
  const filePath = `${process.cwd()}/src/cache/${fileName}`

  return { fileName, filePath }
}

export const buildCache = (data, porfolio) => {
  const balanceData = buildBalance(data, porfolio)
  const { filePath } = getCacheConfigs()

  const saveData = {
    latestDate,
    firstDate,
    data: balanceData
  }

  // overwite if file already exist
  writeFileStream(filePath, JSON.stringify(saveData))
}

const getNearestData = (data, date) => {
  let foundBalace = {}

  const dates = Object.keys(data)
    .sort((a, b) => b - a) // sort by dates descending

  for (const item of dates) {
    if (parseInt(item) <= date) {
      foundBalace = data[item]
      break
    }
  }

  return foundBalace
}

export const getDataFromCache = (path, date) => {
  return new Promise((resolve) => {
    readFile(path, (error, data) => {
      if (error) {
        // treat like no cache file
        throw new Error(error)
      }

      const parsedData = JSON.parse(data)
      const { latestDate: newestDate, firstDate: oldestDate, data: balanceData } = parsedData

      switch (true) {
        case (date >= newestDate): // case date is newer, return lastest balance
          resolve(balanceData[newestDate])
          break
        case date < oldestDate: // case date is older, return starting balance
          resolve({}) // empty balance
          break
        default:
          resolve(getNearestData(balanceData, date))
          break
      }
    })
  })
}
