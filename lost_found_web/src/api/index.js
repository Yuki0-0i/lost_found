import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器 - 自动添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ 认证相关 ============
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const getCurrentUser = () => api.get('/auth/me')

// ============ 物品相关 ============
export const getItems = () => api.get('/items')
export const getItemById = (id) => api.get(`/items/${id}`)
export const getItemsByType = (type) => api.get(`/items/type/${type}`)
export const searchItems = (name) => api.get(`/items/search?name=${name}`)
export const createItem = (data) => api.post('/items', data)
export const updateItem = (id, data) => api.put(`/items/${id}`, data)
export const deleteItem = (id) => api.delete(`/items/${id}`)

// ============ 认领相关 ============
export const createClaim = (data) => api.post('/claims', data)
export const getClaimsByItem = (itemId) => api.get(`/claims/item/${itemId}`)
export const getMyClaims = () => api.get('/claims/my')
export const approveClaim = (id) => api.put(`/claims/${id}/approve`)
export const rejectClaim = (id, reason) => api.put(`/claims/${id}/reject`, { reason })

// ============ 消息相关 ============
export const getMessages = () => api.get('/messages')
export const getUnreadCount = () => api.get('/messages/unread-count')
export const markAsRead = (id) => api.put(`/messages/${id}/read`)

// ============ 公告相关 ============
export const getNotices = () => api.get('/notices')

// ============ 用户相关 ============
export const updateProfile = (data) => api.put('/users/profile', data)
export const updatePassword = (data) => api.put('/users/password', data)
