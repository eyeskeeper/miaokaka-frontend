import { storage } from '@/utils/storage'

/**
 * 今日任务勾选状态的本地缓存层。
 * 后端 PlanVO 不暴露当日任务位图（toggle 为幂等赋值，重复发送安全），
 * 首页与计划详情页共用同一份按天缓存。
 */
const key = (planId: number) => `taskState_${planId}`

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function loadTaskProgress(planId: number): string {
  const cache = storage.get<{ date: string; progress: string }>(key(planId))
  return cache && cache.date === today() ? cache.progress || '' : ''
}

export function saveTaskProgress(planId: number, progress: string) {
  storage.set(key(planId), { date: today(), progress })
}
