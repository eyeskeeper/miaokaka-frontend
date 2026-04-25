export const storage = {
  set(key: string, value: any) {
    uni.setStorageSync(key, JSON.stringify(value))
  },
  get<T>(key: string): T | null {
    const value = uni.getStorageSync(key)
    return value ? JSON.parse(value) : null
  },
  remove(key: string) {
    uni.removeStorageSync(key)
  },
  clear() {
    uni.clearStorageSync()
  }
}