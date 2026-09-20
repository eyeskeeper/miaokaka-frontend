import { acceptHMRUpdate, defineStore } from 'pinia'
import type { NudgeItemVO } from '@/types/api'
import { getUnreadCount } from '@/api/notification'

/** tabBar「我的」的下标（pages.json tabBar.list 顺序） */
export const PROFILE_TAB_INDEX = 4

/** 气泡自动消失时长 */
export const NUDGE_BUBBLE_DURATION = 6000

export interface NudgeBubble {
  id: number
  item: NudgeItemVO
  expireAt: number
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    /** 未读通知数（我的 tab 角标） */
    unread: 0,
    /** 待展示的拍一拍气泡队列（自动过期） */
    nudges: [] as NudgeBubble[]
  }),
  actions: {
    /** 拉取未读数并同步 tabBar 角标（失败保持原值） */
    async refreshUnread() {
      try {
        this.unread = await getUnreadCount()
      } catch {
        return
      }
      this.applyBadge()
    },
    applyBadge() {
      try {
        if (this.unread > 0) {
          uni.setTabBarBadge({
            index: PROFILE_TAB_INDEX,
            text: this.unread > 99 ? '99+' : String(this.unread)
          })
        } else {
          uni.removeTabBarBadge({ index: PROFILE_TAB_INDEX })
        }
      } catch {
        // tabBar 未就绪时忽略
      }
    },
    /** 拍一拍入队展示并震动 */
    pushNudges(items: NudgeItemVO[]) {
      const now = Date.now()
      items.forEach((item, i) => {
        this.nudges.push({ id: now + i, item, expireAt: now + NUDGE_BUBBLE_DURATION })
      })
      if (this.nudges.length > 5) this.nudges = this.nudges.slice(-5)
      try {
        uni.vibrateLong()
      } catch {
        // 部分端不支持震动
      }
    },
    /** 清理过期气泡（组件里定时调用） */
    sweep() {
      if (this.nudges.some((n) => n.expireAt <= Date.now())) {
        this.nudges = this.nudges.filter((n) => n.expireAt > Date.now())
      }
    },
    dismiss(id: number) {
      this.nudges = this.nudges.filter((n) => n.id !== id)
    },
    /** 登出时清空角标与气泡 */
    clear() {
      this.unread = 0
      this.nudges = []
      try {
        uni.removeTabBarBadge({ index: PROFILE_TAB_INDEX })
      } catch {
        // tabBar 未就绪时忽略
      }
    }
  }
})

if (import.meta.hot) {
  acceptHMRUpdate(useNotificationStore, import.meta.hot)
}
