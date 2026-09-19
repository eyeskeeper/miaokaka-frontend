import { acceptHMRUpdate, defineStore } from 'pinia'
import { getStreakRank } from '@/api/rank'
import type { RankItemVO } from '@/types/api'

export const useRankStore = defineStore('rank', {
  state: () => ({
    list: [] as RankItemVO[],
    /** 当前用户真实排名（后端返回，未进 Top50 为 null） */
    myRank: null as number | null,
    loading: false,
    loaded: false
  }),
  actions: {
    async fetchRank() {
      if (this.loading) return
      this.loading = true
      try {
        const data = await getStreakRank()
        this.list = data?.list || []
        this.myRank = data?.myRank ?? null
        this.loaded = true
      } finally {
        this.loading = false
      }
    }
  }
})

if (import.meta.hot) {
  acceptHMRUpdate(useRankStore, import.meta.hot)
}
