import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 工厂函数：创建带拦截器的axios实例
export function createRequestInstance(baseURL: string): AxiosInstance {
  const service: AxiosInstance = axios.create({
    baseURL,
    timeout: 5000
  })

  // 请求拦截器
  service.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  service.interceptors.response.use(
    (response: AxiosResponse) => {
      const res = response.data
      if (res.code === 100000) {
        localStorage.removeItem('token')
        ElMessage.error(res.msg || '请先登录')
        router.push('/login')
        return Promise.reject(new Error(res.msg || '请先登录'))
      }
      if (res.code !== 200  && res.code !== 405) {
        ElMessage.error(res.msg || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
      return res
    },
    (error) => {
      ElMessage.error(error.message || '请求失败')
      return Promise.reject(error)
    }
  )

  return service
}

// 默认主服务实例
const service: AxiosInstance = createRequestInstance(import.meta.env.VITE_API_BASE_URL)

const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service.request(config)
}

export default request 