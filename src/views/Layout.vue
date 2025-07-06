<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">
        <img src="../assets/logo.svg" alt="logo" />
        <span>个人云盘</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        router
      >
      <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/transfer" class="transfer-menu-item">
          <el-icon><UploadFilled /></el-icon>
          <span class="transfer-text">传输列表</span>
          <span v-if="uploadingCount > 0" class="transfer-dot">{{ uploadingCount }}</span>
        </el-menu-item>
        <el-menu-item index="/statistic">
          <el-icon><Folder /></el-icon>
          <span>统计信息</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          <el-breadcrumb>
            <el-breadcrumb-item>{{ route.meta.menuname }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ userStore.username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore, useTransferStore } from '../store'
import { HomeFilled, Folder, ArrowDown, UploadFilled } from '@element-plus/icons-vue'
import { computed, watch, nextTick } from 'vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const transferStore = useTransferStore()
const uploadingCount = computed(() => transferStore.uploadingCount)

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}

watch(
  () => transferStore.tasks,
  () => {
    nextTick(() => {})
  },
  { deep: true }
)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: #409EFF;
  font-size: 18px;
  font-weight: bold;
}

.logo img {
  width: 32px;
  margin-right: 10px;
}

.el-menu-vertical {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}

.transfer-menu-item {
  display: flex !important;
  align-items: center;
  position: relative;
}

.transfer-text {
  margin-left: 4px;
}

.transfer-dot {
  background: #f56c6c;
  color: #fff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  padding: 0;
  border-radius: 50%;
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 1px #fff;
}
</style> 