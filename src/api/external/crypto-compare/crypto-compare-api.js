import { httpGet, logger, LOG_LEVEL } from '../../../services/index.js'
import { API_KEY } from '../../../config/index.js'

// constants
import { URL_MULTI_PRICE } from './constant.js'

export const getMultiPrice = async (tokens, currency) => {
  try {
    const { data } = await httpGet(URL_MULTI_PRICE, {
      fsyms: tokens,
      tsyms: currency
    }, {
      Authorization: API_KEY
    })

    return data
  } catch (error) {
    logger(`Build data error, stacktrace: ${error}`, LOG_LEVEL.INFO)
  }
}
