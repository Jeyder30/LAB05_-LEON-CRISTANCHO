import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const authBaseUrl =
  import.meta.env.VITE_AUTH_BASE_URL || apiBaseUrl.replace(/\/api\/?$/, '')

const authClient = axios.create({
  baseURL: authBaseUrl,
  timeout: 8000,
})

export default authClient
