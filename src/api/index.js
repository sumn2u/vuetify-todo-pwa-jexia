import axios from 'axios'
const baseURL = process.env.VUE_APP_API_BASE || ''

export const ApiError = function ({
  message,
  method,
  url,
  options
}) {
  this.message = message || 'An error occurred'
  this.method = method
  this.url = url
  this.options = options
}

const makeRequest = (method, url, options, request) => {
  const headers = {
    Authorization: `Bearer ${process.env.VUE_APP_AUTH_TOKEN || ''}`,
    ...(request ? request.headers : {})
  }

  return axios({
    baseURL,
    url,
    method,
    headers,
    ...options
  }).then(
    response => response.data,
    error => {
      throw new ApiError({
        message: error && error.response && error.response.message ? error.response.message : error.message,
        method,
        url,
        options
      })
    }
  )
}

export default {
  get: (url, options, request) => makeRequest('get', url, options, request),
  post: (url, options, request) => makeRequest('post', url, options, request),
  put: (url, options, request) => makeRequest('put', url, options, request),
  patch: (url, options, request) => makeRequest('patch', url, options, request),
  delete: (url, options, request) => makeRequest('delete', url, options, request)
}
