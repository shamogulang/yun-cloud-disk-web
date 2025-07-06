<template>
  <div class="files-container">
    <div class="toolbar">
      <div style="font-size:18px;font-weight:bold;">上传列表</div>
    </div>
    <el-table :data="sortedTasks" style="width:100%;" empty-text="暂无上传任务">
      <el-table-column prop="name" label="文件名" min-width="200" />
      <el-table-column prop="size" label="大小" width="120">
        <template #default="{ row }">
          {{ formatSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="进度" width="220">
        <template #default="{ row }">
          <template v-if="row.progress === 100">
            <span style="color:#67c23a;font-weight:bold;">上传完成</span>
          </template>
          <template v-else>
            <el-progress :percentage="row.progress" :text-inside="true" :stroke-width="16" />
            <div style="font-size:12px;color:#888;margin-top:2px;">
              {{ formatSize((row.progress / 100) * row.size) }} / {{ formatSize(row.size) }}
              <span v-if="row.speed > 0" style="margin-left:8px;">
                {{ formatSize(row.speed) }}/s
              </span>
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <template v-if="row.progress !== 100">
            <el-button v-if="row.status === 'uploading'" @click="pauseUpload(row.id)">暂停</el-button>
            <el-button v-else-if="row.status === 'paused'" @click="resumeUpload(row.id)">继续</el-button>
          </template>
          <el-button  @click="cancelUpload(row.id)" circle>
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { UploadFilled, Delete } from '@element-plus/icons-vue'
import { useTransferStore } from '../store'
import { onMounted, onUnmounted, computed } from 'vue'

const transferStore = useTransferStore()

const sortedTasks = computed(() => {
  // 按照任务ID倒序排序
  return [...transferStore.tasks].sort((a, b) => b.id - a.id);
});

function formatSize(size: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

function pauseUpload(id: number) {
  transferStore.pauseTask(id)
}
function resumeUpload(id: number) {
  transferStore.resumeTask(id)
}
function cancelUpload(id: number) {
  transferStore.cancelTask(id)
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
</style> 