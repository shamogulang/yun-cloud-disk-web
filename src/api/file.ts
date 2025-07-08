import fileRequest from './fileRequest'
import SparkMD5 from 'spark-md5'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { useFileStore } from '../store'
import { ElMessage } from 'element-plus'

export function getFileList(path: string) {
  return fileRequest({
    url: '/file/list',
    method: 'get',
    params: { path }
  })
}

export function uploadFile(data: FormData) {
  return fileRequest({
    url: '/file/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function createFolder(data: { filePath: string; fileName: string }) {
  return fileRequest({
    url: '/file/mkdir',
    method: 'post',
    data
  })
}

export function deleteFiles(fileIds: string[]) {
  // 支持批量删除，依次发送DELETE请求
  return Promise.all(
    fileIds.map(id => fileRequest({
      url: `/file/${id}`,
      method: 'DELETE'
    }))
  )
}

export function moveFiles(data: { paths: string[]; targetPath: string }) {
  return fileRequest({
    url: '/file/move',
    method: 'post',
    data
  })
}

export function shareFile(data: { path: string; expireTime?: number }) {
  return fileRequest({
    url: '/file/share',
    method: 'post',
    data
  })
}

export function createShare(data: {
  id?: number;
  shareUrl?: string;
  extractCode?: string;
  expireTime?: string | Date;
  fileId: number;
  userId: number;
  createTime?: string | Date;
  status?: number;
}) {
  return fileRequest({
    baseURL: 'http://127.0.0.1:8083',
    url: '/share',
    method: 'post',
    data
  })
}

export function getFileCount(userId: string | number) {
  return fileRequest({
    url: '/file/count',
    method: 'get',
    headers: { userId: String(userId) }
  })
}

export function getRecentUploadCount(userId: string | number) {
  return fileRequest({
    url: '/file/recent/count',
    method: 'get',
    headers: { userId: String(userId) }
  })
}

export function getRecentUploadList(userId: string | number) {
  return fileRequest({
    url: '/file/recent/list',
    method: 'get',
    headers: { userId: String(userId) }
  })
}

export function getFileUrls(fileIds: (number|string)[]) {
  return fileRequest({
    url: '/file/urls',
    method: 'post',
    data: fileIds
  })
}

export function getVideoPlayUrl(fileId: number|string, resolution: number|string) {
  return fileRequest({
    url: `/file/${fileId}/${resolution}/video-play-url`,
    method: 'get'
  })
}

export function getImagePreviewUrl(fileId: number|string) {
  return fileRequest({
    url: `/file/${fileId}/image-preview-url`,
    method: 'get'
  })
}

// 以下为上传相关逻辑整合自src/utils/upload.ts

interface UploadResponse {
  code: number
  data: {
    id: string
    uploadUrl: string
  }
  message: string
}

export class FileUploader {
  private file: File
  private chunkSize: number = 2 * 1024 * 1024 // 2MB
  private chunks: Blob[] = []
  private hash: string = ''
  private fileId: string = ''

  constructor(file: File) {
    this.file = file
  }

  // 计算文件hash
  private async calculateHash(): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(this.file)
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer
        const spark = new SparkMD5.ArrayBuffer()
        spark.append(buffer)
        this.hash = spark.end()
        resolve(this.hash)
      }
    })
  }

  // 第一阶段：获取文件ID和上传URL
  private async getUploadInfo(): Promise<UploadResponse['data']> {
    const fileStore = useFileStore()
    const hash = await this.calculateHash()
    const response = await fileRequest<UploadResponse['data']>({
      url: '/file/prepare',
      method: 'post',
      data: {
        fileName: this.file.name,
        fileSize: this.file.size,
        filePath: fileStore.currentPath,
        fileType: this.file.type,
        fileHash: hash
      }
    })
    console.log(response)
    return response.data
  }

  // 第二阶段：上传文件到S3
  private async uploadToS3(uploadUrl: string, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      }
      xhr.onload = () => resolve()
      xhr.onerror = () => reject(new Error('上传文件到S3失败'))
      xhr.setRequestHeader('Content-Type', this.file.type)
      xhr.send(this.file)
    })
  }

  // 第三阶段：通知后台上传完成
  private async notifyComplete(fileId:string): Promise<void> {
    await fileRequest({
      url: '/file/complete',
      method: 'post',
      data: {
        fileId: fileId
      }
    })
  }

  // 开始上传流程
  public async upload(onProgress?: (progress: number) => void): Promise<void> {
    try {
      // 第一阶段：获取上传信息
      const data = await this.getUploadInfo()
      // 第二阶段：上传到S3，支持进度
      await this.uploadToS3(data.uploadUrl, onProgress)
      // 第三阶段：通知完成
      await this.notifyComplete(data.id)
      //ElMessage.success('文件上传成功')
    } catch (error) {
      throw error
    }
  }
} 