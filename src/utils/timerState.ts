import { storage } from '@/utils/storage'

/**
 * ⏱10分钟习惯计划的当日计时会话（本地实现，后端只做 planMode 标记）。
 * 会话按天生效：跨天自动作废（重新开始）；持久化开始时间戳，
 * 刷新/锁屏后回来按 startTime 重算剩余/超时，进度不丢。
 * 首页与计划详情页共用同一份按天缓存（与 taskState 同一模式）。
 */

/** 目标坚持时长（秒）：倒计时终点，过后进入正计时 */
export const TENMIN_TARGET_SECONDS = 600

interface TimerSession {
  date: string
  /** 会话开始时间戳(ms) */
  startAt: number
  /** 完成打卡时的总坚持秒数（定格展示用） */
  doneDuration?: number
}

const key = (planId: number) => `timerState_${planId}`

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 读取当日会话；跨天/无会话返回 null（含完成定格态） */
export function loadTimerSession(planId: number): TimerSession | null {
  const cache = storage.get<TimerSession>(key(planId))
  return cache && cache.date === today() ? cache : null
}

/** 开始 / 重新开始：覆盖旧会话 */
export function startTimerSession(planId: number) {
  storage.set(key(planId), { date: today(), startAt: Date.now() })
}

/** 放弃：清除当日会话，回到未开始态 */
export function clearTimerSession(planId: number) {
  storage.remove(key(planId))
}

/** 完成打卡：定格总坚持秒数 */
export function finishTimerSession(planId: number, durationSeconds: number) {
  const s = loadTimerSession(planId)
  if (s) {
    storage.set(key(planId), { ...s, doneDuration: durationSeconds })
  }
}

/** 已坚持秒数（从 startAt 起算） */
export function elapsedSeconds(planId: number): number {
  const s = loadTimerSession(planId)
  return s ? Math.floor((Date.now() - s.startAt) / 1000) : 0
}

/** 秒 → "mm:ss"（超 1 小时 → "h:mm:ss"） */
export function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
