<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from './store'

const userStore = useUserStore()

onMounted(async () => {
  if (userStore.token) {
    try {
      // 如果需要获取用户信息，应该调用API
      // const res = await getUsername()
      // if (res.code === 200) {
      //   userStore.setUsername(res.data.username)
      // }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }
})
</script>

<template>
  <router-view></router-view>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
}
</style>
