<template>
  <div class="files-container">
    <div class="toolbar">
      <el-button-group>
        <el-button @click="handleBack" :disabled="!canGoBack">
          <el-icon><Back /></el-icon>
          返回上级
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </el-button-group>
      <div class="right-tools">
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :on-progress="handleUploadProgress"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            上传文件
          </el-button>
        </el-upload>
        <el-button @click="handleNewFolder">
          <el-icon><FolderAdd /></el-icon>
          新建文件夹
        </el-button>
        <el-button
          type="danger"
          :disabled="!fileStore.selectedFiles.length"
          @click="handleDelete()"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button
          type="success"
          :disabled="!fileStore.selectedFiles.length"
          @click="handleShare()"
        >
          <el-icon><Share /></el-icon>
          分享
        </el-button>
      </div>
    </div>

    <el-table
      :data="fileStore.fileList"
      @selection-change="handleSelectionChange"
      @row-dblclick="handleRowDblClick"
    >
      <el-table-column type="selection" width="55" />
      <!-- <el-table-column prop="id" label="ID" width="80" /> -->
      <el-table-column prop="fileName" label="文件名" min-width="200">
        <template #default="{ row }">
          <span
            class="filename"
            :style="row.fileType === 'directory' ? 'color: #409EFF; cursor: pointer;' : ''"
            @click="row.fileType === 'directory' && handleEnterFolder(row)"
          >
            <img
    v-if="row.thumbnailUrls && row.thumbnailUrls.length > 0"
    :src="row.thumbnailUrls[0].url"
    alt="thumb"
    style="width: 24px; height: 24px; object-fit: cover; margin-right: 6px; vertical-align: middle;"
  />
            {{ row.fileName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="修改时间" width="180" />
      <el-table-column prop="fileSize" label="大小" width="120">
        <template #default="{ row }">
          {{ formatSize(row.fileSize) }}
        </template>
      </el-table-column>
  
    </el-table>

    <el-dialog
      v-model="folderDialogVisible"
      title="新建文件夹"
      width="400px"
    >
      <el-form
        ref="folderFormRef"
        :model="folderForm"
        :rules="folderRules"
        label-width="0"
      >
        <el-form-item prop="name">
          <el-input
            v-model="folderForm.name"
            placeholder="请输入文件夹名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="folderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateFolder">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="shareDialogVisible"
      :title="shareDialogTitleInfo"
      width="500px"
      @close="closeShareDialog"
    >
      <template v-if="!shareSuccess">
        <div style="margin: 24px 0 32px 0; text-align: left;">
          <div style="display: flex; align-items: center; margin-bottom: 32px;">
            <span style="font-weight: bold; margin-right: 16px;">分享有效期：</span>
            <el-radio-group v-model="shareForm.periodType">
              <el-radio :label="0">永久有效</el-radio>
              <el-radio :label="7">7天有效</el-radio>
              <el-radio :label="1">1天有效</el-radio>
            </el-radio-group>
          </div>
        </div>
      </template>
      <template v-else>
        <div style="margin: 24px 0 16px 0; font-size: 16px;">
          成功生成加密链接，{{ shareForm.periodType === 0 ? '永久有效' : shareForm.periodType + '天有效' }}
        </div>
        <el-input v-model="shareResult.linkUrl" readonly style="margin-bottom: 16px;" />
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <el-input v-if="shareResult.passwd" v-model="shareResult.passwd" readonly style="width: 120px; margin-right: 8px;" />
          <div style="flex: 1;"></div>
          <el-button type="primary" @click="copyShareInfo" style="margin-left: 8px;">
            复制链接及提取码
          </el-button>
        </div>
      </template>
      <template #footer>
        <el-button
          v-if="!shareSuccess"
          type="primary"
          @click="submitShare"
          style="width: 160px; height: 40px; font-size: 16px;"
        >
          生成链接
        </el-button>
      </template>
    </el-dialog>

    <el-progress v-if="uploading" :percentage="uploadPercent" style="margin-top: 10px;" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFileStore, useUserStore } from '../store'
import { getFileList, createFolder, deleteFiles, shareFile } from '../api/file'
import { createShare } from '../api/share'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  Back,
  Refresh,
  Upload,
  FolderAdd,
  Delete,
  Share,
  Folder,
  Document,
  Download
} from '@element-plus/icons-vue'
import { FileUploader } from '../api/file'

const fileStore = useFileStore()
const userStore = useUserStore()
const folderDialogVisible = ref(false)
const shareDialogVisible = ref(false)
const shareLink = ref('')
const folderFormRef = ref<FormInstance>()
const shareFormRef = ref<FormInstance>()
const loading = ref(false)
const dirIdStack = ref<string[]>([])
const filesToShare = ref<any[]>([])
const shareSuccess = ref(false)
const shareResult = ref({ linkUrl: '', passwd: '' })
const uploading = ref(false)
const uploadPercent = ref(0)

const folderForm = ref({
  name: ''
})

const shareForm = ref({
  periodType: 0 // 0:永久, 7:7天, 1:1天
})

const folderRules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    { pattern: /^[^\\/:*?"<>|]+$/, message: '文件夹名称不能包含特殊字符', trigger: 'blur' }
  ]
}

const pathList = computed(() => {
  return fileStore.currentPath.split('/').filter(Boolean)
})

const canGoBack = computed(() => dirIdStack.value.length > 0)

onMounted(() => {
  loadFileList()
})

const loadFileList = async () => {
  try {
    const pathParam = dirIdStack.value.length === 0 ? '/' : fileStore.currentPath
    const res = await getFileList(pathParam)
    fileStore.setFileList(res.data)
  } catch (error) {
    console.error(error)
  }
}

const handlePathClick = (index: number) => {
  const newPath = '/' + pathList.value.slice(0, index + 1).join('/')
  fileStore.setCurrentPath(newPath)
  loadFileList()
}

const handleSelectionChange = (selection: any[]) => {
  console.log('selection-change:', selection)
  fileStore.setSelectedFiles(selection)
}

const handleRowDblClick = (row: any) => {
  if (row.fileType === 'directory') {
    fileStore.setCurrentPath(fileStore.currentPath + '/' + row.fileName)
    loadFileList()
  }
}

const handleFileChange = async (file: any) => {
  if (!file) return
  
  try {
    loading.value = true
    const uploader = new FileUploader(file.raw)
    await uploader.upload((progress) => {
      console.log(`上传进度: ${progress}%`)
    })
    // 上传成功后刷新文件列表
    await loadFileList()
  } catch (error) {
    console.error('上传失败:', error)
  } finally {
    loading.value = false
  }
}

const handleCreateFolder = () => {
  folderForm.value.name = ''
  folderDialogVisible.value = true
}

const submitCreateFolder = async () => {
  if (!folderFormRef.value) return
  await folderFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const filePath = dirIdStack.value.length === 0 ? '/' : fileStore.currentPath
        await createFolder({
          filePath,
          fileName: folderForm.value.name
        })
        ElMessage.success('创建成功')
        folderDialogVisible.value = false
        loadFileList()
      } catch (error) {
        console.error(error)
      }
    }
  })
}

const handleDelete = async (files = fileStore.selectedFiles) => {
  // 调试：打印传入的 files 和 fileStore.selectedFiles
  console.log('handleDelete 参数 files:', files);
  console.log('当前 fileStore.selectedFiles:', fileStore.selectedFiles);
  // 统一转成数组，过滤掉没有 id 的
  const fileArr = (Array.isArray(files) ? files : [files]).filter(f => f && typeof f === 'object' && f.id !== undefined && f.id !== null);
  console.log('最终用于删除的 fileArr:', fileArr);
  if (fileArr.length === 0) {
    ElMessage.error('未选中文件，或选中的文件没有有效ID，无法删除');
    return;
  }
  try {
    await ElMessageBox.confirm('确定要删除选中的文件吗？', '提示', {
      type: 'warning'
    });
    await deleteFiles(fileArr.map(file => file.id));
    ElMessage.success('删除成功');
    loadFileList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error);
    }
  }
}

const handleShare = (files?: any[]) => {
  // 如果是事件对象，强制用 fileStore.selectedFiles
  if (files && typeof files === 'object' && files instanceof Event) {
    files = undefined
  }
  if (!files) files = fileStore.selectedFiles ? fileStore.selectedFiles.slice() : []
  console.log('handleShare files:', files)
  if (!Array.isArray(files)) {
    filesToShare.value = files ? [files] : []
  } else {
    filesToShare.value = files
  }
  shareForm.value.periodType = 0
  shareDialogVisible.value = true
}

const submitShare = async () => {
  try {
    const files = (filesToShare.value || []).filter(f => !!f && f.fileName)
    if (files.length === 0) {
      ElMessage.error('请先选择要分享的文件')
      return
    }
    const coIDLst = files.filter(f => f.fileType !== 'directory').map(f => f.id)
    const caIDLst = files.filter(f => f.fileType === 'directory').map(f => f.id)
    if (coIDLst.length === 0 && caIDLst.length === 0) {
      ElMessage.error('请选择要分享的文件或文件夹')
      return
    }
    let period = shareForm.value.periodType
    let periodUnit = 1 // 1=天
    if (period === 0) {
      period = 9999 // 或后端定义的"永久"值
      periodUnit = 1
    }
    const res = await createShare({
      encrypt: 1,
      coIDLst,
      caIDLst,
      pubType: 1,
      period,
      periodUnit
    })
    shareResult.value.linkUrl = res.data?.linkUrl || ''
    shareResult.value.passwd = res.data?.passwd || ''
    shareSuccess.value = true
    ElMessage.success('分享链接已生成')
  } catch (error) {
    console.error(error)
    ElMessage.error('分享失败')
  }
}

const copyShareInfo = () => {
  const text = `${shareResult.value.linkUrl}${shareResult.value.passwd ? ' 提取码：' + shareResult.value.passwd : ''}`
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

const closeShareDialog = () => {
  shareDialogVisible.value = false
  shareSuccess.value = false
}

const handleDownload = async (file: any) => {
  const extIndex = file.fileName.lastIndexOf('.')
  const baseName = extIndex !== -1 ? file.fileName.substring(0, extIndex) : file.fileName
  const ext = extIndex !== -1 ? file.fileName.substring(extIndex) : ''
  const realKey = `${baseName}-${file.fileHash}${ext}`
  const url = `http://127.0.0.1:9000/personal/${realKey}`
  const res = await fetch(url)
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = window.URL.createObjectURL(blob)
  a.download = file.fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(a.href)
}

const formatSize = (size: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

const handleBack = () => {
  if (dirIdStack.value.length > 0) {
    const prevId = dirIdStack.value.pop() || ''
    fileStore.setCurrentPath(prevId)
    loadFileList()
  }
}

const handleRefresh = () => {
  loadFileList()
}

const handleNewFolder = () => {
  folderForm.value.name = ''
  folderDialogVisible.value = true
}

const handleEnterFolder = (row: any) => {
  dirIdStack.value.push(fileStore.currentPath)
  fileStore.setCurrentPath(row.id)
  loadFileList()
}

// 展示分享弹窗顶部信息
const shareDialogTitleInfo = computed(() => {
  console.log(filesToShare)
  const files = (filesToShare.value || []).filter(f => !!f && f.fileName)
  if (files.length === 0) return '请先选择要分享的文件'
  if (files.length === 1) return `分享: ${files[0].fileName}`
  return `分享: "${files[0].fileName}"等${files.length}个文件`
})

const downloadFile = async (row) => {
  const extIndex = row.fileName.lastIndexOf('.')
  const baseName = extIndex !== -1 ? row.fileName.substring(0, extIndex) : row.fileName
  const ext = extIndex !== -1 ? row.fileName.substring(extIndex) : ''
  const realKey = `${baseName}-${row.fileHash}${ext}`
  const url = `http://127.0.0.1:9000/personal/${realKey}`
  const res = await fetch(url)
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = window.URL.createObjectURL(blob)
  a.download = row.fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(a.href)
}

const handleBatchDownload = () => {
  selectedFiles.value.forEach(downloadFile)
}

function handleUploadProgress(event: any) {
  uploading.value = true
  uploadPercent.value = Math.round(event.percent)
  if (event.percent === 100) {
    setTimeout(() => {
      uploading.value = false
      uploadPercent.value = 0
    }, 1000)
  }
}
</script>

<style scoped>
.files-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.right-tools {
  display: flex;
  gap: 10px;
}

.file-list {
  flex: 1;
  overflow: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}

.file-item:hover {
  background-color: #f5f7fa;
}

.file-icon {
  margin-right: 10px;
  color: #909399;
}

.file-name {
  flex: 1;
}

.file-actions {
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.file-info {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}

:deep(.el-upload) {
  display: inline-block;
}
</style> 