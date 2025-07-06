<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>存储空间</span>
            </div>
          </template>
          <div class="stat-content">
            <el-progress
              :percentage="storagePercentage"
              :format="format"
            />
            <div class="stat-info">
              <span>已使用: {{ formatSize(usedStorage) }}</span>
              <span>总空间: {{ formatSize(totalStorage) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>文件数量</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-number">{{ fileCount }}</div>
            <div class="stat-label">个文件</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>分享数量</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-number">{{ shareCount }}</div>
            <div class="stat-label">个分享</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>最近上传</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-number">{{ recentUploads }}</div>
            <div class="stat-label">个文件</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-files" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>最近文件</span>
        </div>
      </template>
      <el-table :data="recentFiles" style="width: 100%">
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="fileSize" label="大小" width="120">
          <template #default="{ row }">
            {{ formatSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="修改时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getSpaceStatistics } from '../api/space'
import { getShareCount } from '../api/share'
import { getFileCount, getRecentUploadCount, getRecentUploadList } from '../api/file'
import { useUserStore } from '../store'

const totalStorage = ref(0)
const usedStorage = ref(0)
const fileCount = ref(0)
const shareCount = ref(0)
const recentUploads = ref(0)
const userStore = useUserStore()

onMounted(async () => {
  try {
    const res = await getSpaceStatistics() as any
    console.log(res)
    if (res.code === 200) {
      totalStorage.value = res.data.totalSpace
      usedStorage.value = res.data.usedSpace
    }
    // 获取文件数量
    if (userStore.userId) {
      const fileRes = await getFileCount(userStore.userId) as any
      if (fileRes.code === 200) {
        fileCount.value = fileRes.data
      }
      // 获取最近上传数量
      const recentRes = await getRecentUploadCount(userStore.userId) as any
      if (recentRes.code === 200) {
        recentUploads.value = recentRes.data
      }
      // 获取最近文件列表
      const recentListRes = await getRecentUploadList(userStore.userId) as any
      if (recentListRes.code === 200) {
        recentFiles.value = recentListRes.data || []
      }
    }
    // 获取分享数量
    const shareRes = await getShareCount() as any
    if (shareRes.code === 200) {
      shareCount.value = shareRes.data
    }
  } catch (e) {
    // 错误处理
  }
})

const storagePercentage = computed(() => {
  if (!totalStorage.value) return 0
  return Math.round((usedStorage.value / totalStorage.value) * 100)
})

function formatSize(size: number) {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

function format(percentage: number) {
  return percentage + '%'
}

const recentFiles = ref([])
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.stat-card {
  height: 180px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content {
  text-align: center;
  padding: 20px 0;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.stat-label {
  color: #909399;
}

.stat-info {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  color: #606266;
}

.recent-files {
  margin-top: 20px;
}
</style> 