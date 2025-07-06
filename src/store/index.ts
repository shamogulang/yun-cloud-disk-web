import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TransferTask {
  id: number
  name: string
  size: number
  progress: number
  status: 'uploading' | 'paused' | 'done'
  speed: number // bytes per second
  timer?: number
  lastUploaded?: number
  lastTime?: number
}

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

export const useTransferStore = defineStore('transfer', () => {
  const tasks = ref<TransferTask[]>([])
  let nextId = 1

  function addTask(file: { name: string, size: number }): number {
    const now = Date.now()
    const task: TransferTask = {
      id: nextId++,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      speed: 0,
      lastUploaded: 0,
      lastTime: now
    }
    tasks.value.push(task)
    startUpload(task)
    return task.id
  }

  function startUpload(task: TransferTask) {
    task.timer = window.setInterval(() => {
      if (task.status !== 'uploading') return
      const now = Date.now()
      const deltaTime = (now - (task.lastTime || now)) / 1000 // 秒
      const delta = Math.floor(Math.random() * 5 * 1024 * 1024) // 0~5MB
      let uploaded = (task.progress / 100) * task.size + delta
      if (uploaded >= task.size) {
        uploaded = task.size
        task.progress = 100
        task.status = 'done'
        task.speed = 0
        clearInterval(task.timer)
      } else {
        task.progress = +(uploaded / task.size * 100).toFixed(2)
        task.speed = deltaTime > 0 ? delta / deltaTime : 0
      }
      task.lastUploaded = uploaded
      task.lastTime = now
    }, 1000)
  }

  function pauseTask(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (task) task.status = 'paused'
  }
  function resumeTask(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (task) task.status = 'uploading'
  }
  function cancelTask(id: number) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      const task = tasks.value[idx]
      if (task.timer) clearInterval(task.timer)
      tasks.value.splice(idx, 1)
    }
  }
  const uploadingCount = computed(() => tasks.value.filter(t => Number(t.progress) < 100).length)

  return { tasks, addTask, pauseTask, resumeTask, cancelTask, uploadingCount }
}) 