/**
 * easycom 组件全局类型声明（pages.json easycom autoscan 无法自动提供类型）
 */
import type { DefineComponent } from 'vue'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    PixelCard: DefineComponent<
      { title?: string; noPadding?: boolean },
      Record<string, unknown>,
      unknown
    >
    PixelCat: DefineComponent<
      { catType?: number; pose?: 'idle' | 'happy' | 'attack'; size?: number },
      Record<string, unknown>,
      unknown
    >
    BattleResult: DefineComponent<
      {
        visible: boolean
        result: import('@/types/api').CheckInResultVO | null
        bossLevel?: number
      },
      Record<string, unknown>,
      unknown
    >
    CheckinCalendar: DefineComponent<
      { planId: number },
      Record<string, unknown>,
      unknown
    >
  }
}

export {}
