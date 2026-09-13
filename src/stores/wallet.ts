import { defineStore } from 'pinia'
import { getWallet } from '@/api/wallet'
import type { CoinTransaction } from '@/types/api'

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    balance: 0,
    transactions: [] as CoinTransaction[],
    total: 0,
    current: 1,
    pageSize: 10,
    loading: false,
    hasMore: true
  }),
  actions: {
    async fetchWallet(reset = true) {
      if (this.loading) return
      if (!reset && !this.hasMore) return
      this.loading = true
      try {
        const page = reset ? 1 : this.current + 1
        const data = await getWallet(page, this.pageSize)
        this.balance = data.balance
        this.total = data.transactions.total
        if (reset) this.transactions = data.transactions.records || []
        else this.transactions.push(...(data.transactions.records || []))
        this.current = page
        this.hasMore = this.transactions.length < this.total
      } finally {
        this.loading = false
      }
    }
  }
})
