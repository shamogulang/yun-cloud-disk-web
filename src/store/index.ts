import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || '',
    userId: Number(localStorage.getItem('userId')) || 0 // 默认值，可根据实际登录后赋值
  }),
  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setUsername(username: string) {
      this.username = username
      localStorage.setItem('username', username)
    },
    setUserId(id: number) {
      this.userId = id
      localStorage.setItem('userId', id.toString())
    },
    logout() {
      this.token = ''
      this.username = ''
      this.userId = 0
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('userId')
    }
  }
})

export const useFileStore = defineStore('file', {
  state: () => ({
    currentPath: '/',
    fileList: [] as any[],
    selectedFiles: [] as any[]
  }),
  actions: {
    setCurrentPath(path: string) {
      this.currentPath = path
    },
    setFileList(files: any[]) {
      this.fileList = files
    },
    setSelectedFiles(files: any[]) {
      this.selectedFiles = files
    }
  }
}) 