import { config } from 'dotenv'
config()

// external api
export const API_KEY = process.env.API_KEY
export const API_URL = process.env.API_URL

// datetime formats & locale
export const DATE_FORMAT = process.env.DATE_FORMAT
export const DATE_LOCALE = process.env.DATE_LOCALE

// currency
export const TYPE_CURRENCY = process.env.TYPE_CURRENCY

// cache
export const CACHE_DAYS = process.env.CACHE_DAYS

// logging
export const LOCATION_DIR_LOG = `${process.cwd()}/src${process.env.LOCATION_DIR_LOG}`

// file
export const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE
