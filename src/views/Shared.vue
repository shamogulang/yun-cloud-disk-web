<template>
  <div class="share-success-page" v-if="verified">
    <div class="share-header">
      <div class="share-header-left">
        <img :src="logo" class="share-logo" />
        <span class="share-title">个人移动云盘</span>
      </div>
      <div class="share-header-right">
        <div class="actions-btn-group">
          <el-button
            v-if="isOwner"
            type="danger"
            plain
            @click="cancelShare"
          >取消分享</el-button>
          <el-button
            v-else
            type="primary"
            plain
            @click="saveToCloud"
            :disabled="!selectedFiles.length"
          >保存到我的云盘</el-button>
          <el-button plain :disabled="!selectedFiles.length" type="success" @click="handleBatchDownload">下载</el-button>
        </div>
        <div class="header-user-info" v-if="userStore.token">
          <img src="@/assets/avatar.png" class="avatar" />
          <span class="username">{{ userStore.username }}</span>
          <a class="logout" @click="logout">退出</a>
        </div>
      </div>
    </div>
    <div class="share-main">
      <div class="user-info-card">
        <img :src="avatarImg" class="avatar" />
        <div class="user-meta">
          <div class="nickname">{{ shareContent.nickname }}</div>
          <div class="desc">{{ shareContent.expireTime }} {{ shareContent.expireDesc }}</div>
        </div>
      </div>
      <el-table :data="shareContent.fileList || []" style="margin-top: 24px;" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="fileName" label="文件名">
          <template #default="{ row }">
            <span v-if="row.type === 'directory'" style="color: #409EFF; font-weight: bold;">
              <el-icon><Folder /></el-icon>
              {{ row.fileName }}
            </span>
            <span v-else>
              <el-icon><Document /></el-icon>
              {{ row.fileName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="修改时间" />
        <el-table-column prop="fileSize" label="大小" />
      </el-table>
    </div>
  </div>
  <div v-else class="share-verify-page">
    <div class="share-card">
      <div class="share-card-header">
        <img :src="avatarImg" class="avatar" />
        <div class="user-meta">
          <div class="nickname">{{ shareContent.nickname }}</div>
          <div class="desc">给你分享了文件</div>
        </div>
      </div>
      <div class="share-card-action">
        <el-input v-model="passwd" placeholder="请输入提取码" style="width: 240px; margin-right: 16px;" />
        <el-button type="primary" @click="verifyPasswd" style="width: 120px;" :disabled="!passwd">提取文件</el-button>
      </div>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    </div>
  </div>
  <el-dialog v-model="showSimpleLogin" title="登录" width="350px" :close-on-click-modal="false">
    <el-form :model="simpleLoginForm" label-width="0">
      <el-form-item>
        <el-input v-model="simpleLoginForm.username" placeholder="用户名" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="simpleLoginForm.password" type="password" placeholder="密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="simpleLoginLoading" @click="handleSimpleLogin" style="width:100%">登录</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getShareDetail, verifyShare } from '../api/share'
import { cancelShareById } from '../api/shareRequest'
import avatarImg from '@/assets/avatar.png'
import logo from '@/assets/logo.svg'
import { Folder, Document } from '@element-plus/icons-vue'
import { login } from '../api/user'
import { useUserStore } from '../store'

const route = useRoute()
const router = useRouter()
const linkId = route.params.linkId as string
const passwd = ref('')
const errorMsg = ref('')
const verified = ref(false)
const loading = ref(true)
const shareContent = ref({
  avatar: '',
  nickname: '',
  encrypt: 1,
  username: '',
  userId: '',
  expireTime: '',
  expireDesc: '',
  fileList: [] as any[]
})
const selectedFiles = ref<any[]>([])
const currentUserId = localStorage.getItem('userId')
console.log(currentUserId)
const isLoggedIn = computed(() => !!userStore.token)
const isOwner = computed(() => {
  return isLoggedIn.value && userStore.userId && shareContent.value.userId && String(userStore.userId) === String(shareContent.value.userId)
})
console.log(isOwner)
const showSimpleLogin = ref(false)
const simpleLoginForm = ref({ username: '', password: '' })
const simpleLoginLoading = ref(false)
const userStore = useUserStore()

onMounted(async () => {
  try {
    const res: any = await getShareDetail(linkId)
    console.log(res)
    if (res.code === 200) {
      shareContent.value = {
        ...shareContent.value,
        ...res.data,
        nickname: res.data.username
      }
      console.log(shareContent.value)
      if (res.data.encrypt !== 1) {
        verified.value = true
      }
    } else {
      errorMsg.value = '分享链接不存在或已失效'
    }
  } catch (e) {
    errorMsg.value = '获取分享信息失败'
  } finally {
    loading.value = false
  }
})

const verifyPasswd = async () => {
  try {
    const res: any = await verifyShare({ linkId, passwd: passwd.value })
    console.log(res)
    console.log(12)
    if (res.code === 200) {
      const fileList = Array.isArray(res.data) ? res.data : []
      if (!fileList.length) {
        router.replace({ path: '/share-cancelled' })
        return
      }
      verified.value = true
      errorMsg.value = ''
      shareContent.value.fileList = fileList
    } else if (res.code === 405) {
      console.log(123)
      router.replace({ path: '/share-cancelled' })
    } else {
      errorMsg.value = res.msg || '提取码错误'
    }
  } catch (e) {
    console.log(e)
    errorMsg.value = '网络错误，请稍后重试'
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedFiles.value = selection
}

const handleSimpleLogin = async () => {
  if (!simpleLoginForm.value.username || !simpleLoginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  simpleLoginLoading.value = true
  try {
    const res: any = await login(simpleLoginForm.value)
    if (res.code === 200) {
      userStore.setToken(res.data.token)
      userStore.setUsername(res.data.username)
      userStore.setUserId(res.data.userId)
      showSimpleLogin.value = false
      ElMessage.success('登录成功')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } finally {
    simpleLoginLoading.value = false
  }
}

const saveToCloud = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    showSimpleLogin.value = true
    return
  }
  // 已登录时的保存逻辑
  if (!selectedFiles.value.length) {
    ElMessage.warning('请先选择要保存的文件')
    return
  }
  // 批量保存逻辑
  console.log('要保存的文件:', selectedFiles.value)
}

const cancelShare = async () => {
  try {
    const res: any = await cancelShareById(linkId)
    if (res.code === 200) {
      ElMessage.success('取消分享成功')
      router.push('/share-cancelled')
    } else {
      ElMessage.error(res.msg || '取消分享失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '取消分享失败')
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const downloadFile = async (row: any) => {
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
</script>

<style scoped>
.share-success-page {
  background: #fafbfc;
  min-height: 100vh;
}
.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 48px 0 48px;
}
.share-header-left {
  display: flex;
  align-items: center;
}
.share-logo {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}
.share-title {
  font-size: 22px;
  font-weight: bold;
  color: #1677ff;
}
.share-header-right {
  display: flex;
  align-items: center;
}
.actions-btn-group {
  display: flex;
  gap: 16px;
  margin-right: 24px;
}
.login-link {
  color: #1677ff;
  font-size: 16px;
  text-decoration: none;
}
.share-main {
  max-width: 1100px;
  margin: 32px auto 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 32px 40px;
}
.user-info-card {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-right: 24px;
}
.user-meta {
  display: flex;
  flex-direction: column;
}
.nickname {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}
.desc {
  color: #888;
  font-size: 14px;
}
.share-verify-page {
  min-height: 100vh;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.share-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px #0000000d;
  padding: 48px 64px;
  min-width: 520px;
}
.share-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}
.share-card-action {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.error-msg {
  color: #f56c6c;
  margin-top: 12px;
}
.header-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.username {
  font-size: 16px;
  color: #333;
}
.logout {
  color: #1677ff;
  margin-left: 8px;
  cursor: pointer;
}
</style> 