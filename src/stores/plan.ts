import { acceptHMRUpdate, defineStore } from 'pinia'
import { getPlanList } from '@/api/plan'
import type { CatVO, PlanVO } from '@/types/api'

export interface CatEntry {
  plan: PlanVO
  cat: CatVO
}

export const usePlanStore = defineStore('plan', {
  state: () => ({
    plans: [] as PlanVO[],
    loaded: false,
    loading: false
  }),
  getters: {
    /** 进行中的计划 */
    activePlans: (state) => state.plans.filter((p) => p.status === 0),
    pausedPlans: (state) => state.plans.filter((p) => p.status !== 0),
    /** 今日待打卡数 */
    todayRemaining: (state) => state.plans.filter((p) => p.status === 0 && !p.todayChecked).length,
    /** 猫窝数据：每只猫带着它所属的计划 */
    cats: (state): CatEntry[] =>
      state.plans.filter((p) => p.cat).map((p) => ({ plan: p, cat: p.cat as CatVO })),
    totalCatLevel(): number {
      return this.cats.reduce((sum, e) => sum + e.cat.level, 0)
    },
    totalBossDefeated(): number {
      return this.cats.reduce((sum, e) => sum + e.cat.totalBossDefeated, 0)
    }
  },
  actions: {
    async fetchPlans(force = false) {
      if (this.loading) return
      if (this.loaded && !force) return
      this.loading = true
      try {
        this.plans = (await getPlanList()) || []
        this.loaded = true
      } finally {
        this.loading = false
      }
    },
    /** 打卡/补卡/任务变更后局部更新计划，避免整页刷新 */
    applyPlan(updated: PlanVO) {
      const idx = this.plans.findIndex((p) => p.id === updated.id)
      if (idx >= 0) this.plans.splice(idx, 1, updated)
      else this.plans.push(updated)
    },
    removePlan(planId: number) {
      this.plans = this.plans.filter((p) => p.id !== planId)
    }
  }
})

if (import.meta.hot) {
  acceptHMRUpdate(usePlanStore, import.meta.hot)
}
