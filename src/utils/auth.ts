import { useUserStore } from '@/stores/user'

/**
 * 页面级登录守卫：未登录时提示并跳转登录页
 * 用法：在受保护页面 onShow 首行 `if (!ensureLogin()) return`
 */
export function ensureLogin(): boolean {
  const userStore = useUserStore()
  if (userStore.isLoggedIn) return true
  uni.showToast({ title: '请先登录', icon: 'none' })
  setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 300)
  return false
}
