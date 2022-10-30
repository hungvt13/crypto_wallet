import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { readFileStream, runCli, checkIsCSV, checkIsGoodFileSize, cache, buildCache, getDataFromCache, existFile, appendLastData, getAllData, getCacheConfigs, logger, LOG_LEVEL } from './src/services/index.js'
import { accumulate, getRawPorfolio, buildPorfolio, queryParse, joinTokens } from './src/domain/index.js'
import { filterKeyValObject } from './src/utils/index.js'
import { MAX_FILE_SIZE } from './src/config/index.js'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

const print = (data, tokens) => {
  buildPorfolio(data, tokens)
    .then((res) => {
      console.info('[APP]: Your balance:')
      console.table(res)
    })
    .catch((error) => logger(`Print data error, stacktrace: ${error}`, LOG_LEVEL.ERROR))
}

const start = (path, tokens, date) => {
  readFileStream({
    filename: path,
    func: (line, lineCount) => {
      accumulate(line, lineCount, tokens, date)
    },
    start: 1
  })
    .then(() => {
      print(getRawPorfolio(), joinTokens(tokens))
    })
    .catch((error) => logger(`Build data error, stacktrace: ${error}`, LOG_LEVEL.ERROR))
}

const startFromFile = (filepath, tokens, date) => {
  if (!checkIsCSV(filepath)) {
    logger('Input file error: This is not a CSV file', LOG_LEVEL.ERROR)
    throw new Error('This is not a CSV file')
  }

  if (!checkIsGoodFileSize(filepath, MAX_FILE_SIZE)) {
    logger('Input file error: This is not a CSV file', LOG_LEVEL.ERROR)
    throw new Error(`This file larger than ${MAX_FILE_SIZE}GB`)
  }

  start(
    filepath,
    tokens,
    date
  )
}

const init = () => {
  const args = runCli()
  const { tokens, date, filepath = `${process.cwd()}/src/data/transactions.csv` } = queryParse(args)

  // case init app
  if (args.length === 1 && args.includes('init')) {
    console.info('[APP]: initializing data...')

    readFileStream({
      filename: filepath,
      func: (line, lineCount) => {
        accumulate(line, lineCount)
        cache(line)
      },
      start: 1
    })
      .then(() => {
        appendLastData()
        console.info('[APP]: building fake cache...')
        buildCache(getAllData(), getRawPorfolio())
        console.info('[APP]: building fake cache...completed')

        logger(`Init data completed, path: ${filepath}`)
      })
      .catch((error) => logger(`Init data error, stacktrace: ${error}`, LOG_LEVEL.ERROR))
  } else if (args.includes('--no-cache')) {
    startFromFile(filepath, tokens, date)
  } else {
    console.info('[APP]: Getting porfolio...')
    const { filePath: cacheFilePath } = getCacheConfigs()

    existFile(cacheFilePath)
      .then((isExist) => {
        // If exist in cache
        if (isExist) {
          console.info('[APP]: Cache found...')
          getDataFromCache(cacheFilePath, date)
            .then((foundBalance) => {
              const filteredKeys = tokens.length ? filterKeyValObject(tokens, foundBalance) : foundBalance
              print(filteredKeys, joinTokens(tokens))
            })
        } else {
          console.info('[APP]: Cache not found...')
          console.info('[APP]: Read from orignal file...')
          logger('Cache mode but no cache found', LOG_LEVEL.INFO)
          startFromFile(filepath, tokens, date)
        }
      })
  }
}

init()
