import { writeFileStream } from '../file.js'
import { getUTCDate } from '../date-time.js'

import { LOG_LEVEL } from './constant.js'
import { LOCATION_DIR_LOG } from '../../config/index.js'

export const logger = (data, logLevel = LOG_LEVEL.INFO) => {
  const todayDate = getUTCDate(undefined, null, null).format('MMDDYYYY')
  const timestamp = getUTCDate(undefined, null, null).format('HH:mm:ss')
  const fileName = `${todayDate}.log`
  const path = `${LOCATION_DIR_LOG}/${fileName}`

  const formattedData = `[${logLevel}][${timestamp}]: ${data}`

  writeFileStream(path, formattedData, { flags: 'a' })
}
