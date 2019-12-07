import axios from 'axios'
import LocalStorageService from '@/localStorage'
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

const localStorageService = LocalStorageService.getService()
// Add a request interceptor
axios.interceptors.request.use(
  config => {
    const token = localStorageService.getAccessToken()
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    // config.headers['Content-Type'] = 'application/json';
    return config
  },
  error => {
    Promise.reject(error)
  })

// Add a response interceptor
axios.interceptors.response.use((response) => {
  return response
}, function (error) {
  const originalRequest = error.config

  if (error.response.status === 401 && originalRequest.url.includes(`${baseURL}/ds/todos`)) {
    return axios.post(`${baseURL}/auth`, {
      'method': 'apk',
      'key': process.env.VUE_APP_JEXIA_API_KEY,
      'secret': process.env.VUE_APP_API_SECRET
    }).then(response => {
      localStorageService.setToken(response.data)
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorageService.getAccessToken()
      return axios(originalRequest)
    })
  }

  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true
    const refreshToken = localStorageService.getRefreshToken()
    return axios.post(`${baseURL}/auth/refresh`, {
      'refresh_token': refreshToken
    })
      .then(response => {
        if (response.status === 201) {
          localStorageService.setToken(response.data)
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorageService.getAccessToken()
          return axios(originalRequest)
        }
      })
  }
  return Promise.reject(error)
})

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
