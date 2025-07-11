// API配置工具
const getApiUrl = (port: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1'
  return `${baseUrl}:${port}`
}

export const API_CONFIG = {
  FILE_API: getApiUrl(import.meta.env.VITE_FILE_API_PORT || '8080'),
  SHARE_API: getApiUrl(import.meta.env.VITE_SHARE_API_PORT || '8083'),
  SPACE_API: getApiUrl(import.meta.env.VITE_SPACE_API_PORT || '8082'),
  USER_API: getApiUrl(import.meta.env.VITE_USER_API_PORT || '8081'),
}

// 开发环境下打印API配置，方便调试
if (import.meta.env.DEV) {
  console.log('API配置:', API_CONFIG)
} 