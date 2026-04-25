import { defineStore } from 'pinia'

export interface RankItem {
  userId: string
  nickname: string
  avatar: string
  points: number
  rank: number
}

export const useRankingStore = defineStore('ranking', {
  state: () => ({
    ranks: [] as RankItem[],
    currentRank: 0
  }),
  actions: {
    fetchRanking() {
      // 模拟排行榜数据
      this.ranks = [
        { userId: '1', nickname: '打卡达人', avatar: '', points: 9999, rank: 1 },
        { userId: '2', nickname: '自律之王', avatar: '', points: 8888, rank: 2 },
        { userId: '3', nickname: '坚持就是胜利', avatar: '', points: 7777, rank: 3 },
        { userId: '4', nickname: '努力奋斗', avatar: '', points: 6666, rank: 4 },
        { userId: '5', nickname: '永不放弃', avatar: '', points: 5555, rank: 5 }
      ]
    }
  }
})