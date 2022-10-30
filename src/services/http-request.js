import axios from 'axios'

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

const instance = axios.create({ headers })

const buildRequestOptions = (options) => {
  return {
    ...headers,
    ...(options.Authorization ? options.Authorization : {})
  }
}

export const httpGet = (url, params, options) => {
  return instance.get(url, { params, ...buildRequestOptions(options) })
}
