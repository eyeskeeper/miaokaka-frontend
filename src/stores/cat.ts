import { defineStore } from 'pinia'

export const useCatStore = defineStore('cat', {
  state: () => ({
    name: '小橘猫',
    level: 1,
    exp: 0,
    maxExp: 100,
    points: 0,
    attributes: {
      strength: 10,    // 力量
      agility: 10,     // 敏捷
      intelligence: 10 // 智力
    },
    appearance: {
      color: 'orange',
      style: 'normal'
    },
    battles: [] // 今日战斗记录
  }),
  getters: {
    levelProgress: (state) => (state.exp / state.maxExp) * 100
  },
  actions: {
    addPoints(amount: number) {
      this.points += amount
      this.exp += amount
      if (this.exp >= this.maxExp) {
        this.levelUp()
      }
    },
    levelUp() {
      this.level++
      this.exp = this.exp - this.maxExp
      this.maxExp = Math.floor(this.maxExp * 1.2)
      this.attributes.strength += 2
      this.attributes.agility += 2
      this.attributes.intelligence += 2
    },
    upgradeAttribute(type: 'strength' | 'agility' | 'intelligence', cost: number) {
      if (this.points >= cost) {
        this.points -= cost
        this.attributes[type] += 5
        return true
      }
      return false
    }
  }
})