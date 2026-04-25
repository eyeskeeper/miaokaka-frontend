import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: '',
    nickname: '喵星人',
    avatar: '',
    phone: '',
    isLoggedIn: false,
    token: ''
  }),
  getters: {
    isLogin: (state) => state.isLoggedIn
  },
  actions: {
    setUserInfo(info: any) {
      Object.assign(this, info)
    },
    logout() {
      this.isLoggedIn = false
      this.token = ''
    }
  }
})