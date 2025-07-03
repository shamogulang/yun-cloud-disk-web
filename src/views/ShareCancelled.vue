<template>
  <div class="share-cancelled-page">
    <div class="header">
      <div class="header-left">
        <img src="@/assets/logo.svg" class="logo" />
        <span class="title">个人移动云盘</span>
      </div>
      <div class="header-right">
        <img src="@/assets/avatar.png" class="avatar" />
        <span class="username">{{ username }}</span>
        <a class="logout" @click="logout">退出</a>
      </div>
    </div>
    <div class="cancelled-content">
      <div class="cancelled-text">来晚了，分享已被取消</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../store'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const username = userStore.username || '未登录'

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.share-cancelled-page {
  min-height: 100vh;
  background: #fafbfc;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 48px 0 48px;
  background: #fff;
}
.header-left {
  display: flex;
  align-items: center;
}
.logo {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}
.title {
  font-size: 22px;
  font-weight: bold;
  color: #1677ff;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
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
.cancelled-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.cancelled-text {
  font-size: 20px;
  color: #888;
  margin-top: 24px;
}
</style> 