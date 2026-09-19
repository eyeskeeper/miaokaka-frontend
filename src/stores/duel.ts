import { acceptHMRUpdate, defineStore } from 'pinia'
import { getDuelList } from '@/api/duel'
import type { DuelVO } from '@/types/api'

export const useDuelStore = defineStore('duel', {
  state: () => ({
    duels: [] as DuelVO[],
    loaded: false,
    loading: false
  }),
  getters: {
    recruiting: (state) => state.duels.filter((d) => d.status === 0),
    ongoing: (state) => state.duels.filter((d) => d.status === 1),
    ended: (state) => state.duels.filter((d) => d.status === 2)
  },
  actions: {
    async fetchDuels(force = false) {
      if (this.loading) return
      if (this.loaded && !force) return
      this.loading = true
      try {
        this.duels = (await getDuelList()) || []
        this.loaded = true
      } finally {
        this.loading = false
      }
    },
    applyDuel(updated: DuelVO) {
      const idx = this.duels.findIndex((d) => d.id === updated.id)
      if (idx >= 0) this.duels.splice(idx, 1, updated)
      else this.duels.unshift(updated)
    },
    removeDuel(duelId: number) {
      this.duels = this.duels.filter((d) => d.id !== duelId)
    }
  }
})

if (import.meta.hot) {
  acceptHMRUpdate(useDuelStore, import.meta.hot)
}
