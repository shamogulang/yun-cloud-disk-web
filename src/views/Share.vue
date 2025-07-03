<template>
  <div class="share-container">
    <el-card class="share-card">
      <template #header>
        <div class="card-header">
          <h2>文件分享</h2>
        </div>
      </template>
      <el-form label-width="80px">
        <el-form-item label="分享链接">
          <el-input v-model="shareUrl" readonly>
            <template #append>
              <el-button @click="copyShareUrl">复制</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="提取码" v-if="extractCode">
          <el-input v-model="extractCode" readonly>
            <template #append>
              <el-button @click="copyExtractCode">复制</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="有效期">
          <span>{{ expireTimeDisplay }}</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 这里可以通过props、路由参数或API获取分享信息
const shareUrl = ref('')
const extractCode = ref('')
const expireTime = ref('')

// 示例：从路由参数获取
// import { useRoute } from 'vue-router'
// const route = useRoute()
// shareUrl.value = route.query.shareUrl as string || ''
// extractCode.value = route.query.extractCode as string || ''
// expireTime.value = route.query.expireTime as string || ''

const expireTimeDisplay = computed(() => {
  if (!expireTime.value) return '永久'
  const date = new Date(expireTime.value)
  return date.toLocaleString()
})

const copyShareUrl = () => {
  navigator.clipboard.writeText(shareUrl.value)
  ElMessage.success('分享链接已复制')
}
const copyExtractCode = () => {
  navigator.clipboard.writeText(extractCode.value)
  ElMessage.success('提取码已复制')
}
</script>

<style scoped>
.share-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}
.share-card {
  width: 500px;
}
.card-header {
  text-align: center;
}
</style> 