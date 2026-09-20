import { acceptHMRUpdate, defineStore } from 'pinia'
import { getMe, login as loginApi, register as registerApi } from '@/api/user'
import type { LoginUserVO } from '@/types/api'
import { clearToken, getToken, setToken } from '@/utils/request'
import { startPolling } from '@/utils/poll'
import { storage } from '@/utils/storage'
import { useNotificationStore } from '@/stores/notification'

const USER_KEY = 'userInfo'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: storage.get<LoginUserVO>(USER_KEY)
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    displayName: (state) => state.userInfo?.userName || '喵友',
    avatar: (state) => state.userInfo?.userAvatar || '',
    totalPoints: (state) => state.userInfo?.totalPoints ?? 0,
    currentStreak: (state) => state.userInfo?.currentStreak ?? 0
  },
  actions: {
    async register(userAccount: string, userPassword: string, checkPassword: string) {
      return registerApi({ userAccount, userPassword, checkPassword })
    },
    async login(userAccount: string, userPassword: string) {
      const data = await loginApi({ userAccount, userPassword })
      this.token = data.token
      setToken(data.token)
      this.setUserInfo(data.user)
      // 登录后立即刷新通知角标并启动轮询
      useNotificationStore().refreshUnread()
      startPolling()
    },
    setUserInfo(user: LoginUserVO) {
      this.userInfo = user
      storage.set(USER_KEY, user)
    },
    /** 刷新用户信息（打卡/补卡后积分连击会变） */
    async fetchMe() {
      if (!this.token) return
      try {
        const me = await getMe()
        this.setUserInfo(me)
      } catch {
        // 静默失败，不打断页面
      }
    },
    logout() {
      clearToken()
      storage.remove(USER_KEY)
      this.token = ''
      this.userInfo = null
      useNotificationStore().clear()
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
})

if (import.meta.hot) {
  acceptHMRUpdate(useUserStore, import.meta.hot)
}
