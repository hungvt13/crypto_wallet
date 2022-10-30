import { extname } from 'path'
import { getFileSizeInGB } from './file.js'

export const checkIsCSV = (file) => {
  return ['.CSV', '.csv'].includes(extname(file))
}

export const checkIsGoodFileSize = (file, size) => {
  return getFileSizeInGB(file) <= size
}
