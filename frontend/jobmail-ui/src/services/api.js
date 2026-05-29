import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5203',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jobmail_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const storeToken = (token) => {
  if (token) {
    localStorage.setItem('jobmail_token', token)
  } else {
    localStorage.removeItem('jobmail_token')
  }
}

export default api
