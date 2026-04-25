import { defineStore } from 'pinia'

export interface Plan {
  id: string
  title: string
  description: string
  points: number
  checked: boolean
  checkInTime?: string
  bosses: Boss[]
}

export interface Boss {
  id: string
  name: string
  hp: number
  maxHp: number
  defeated: boolean
}

export const usePlanStore = defineStore('plan', {
  state: () => ({
    todayPlans: [] as Plan[],
    history: [] as any[]
  }),
  actions: {
    addPlan(plan: Plan) {
      this.todayPlans.push(plan)
    },
    checkIn(planId: string) {
      const plan = this.todayPlans.find(p => p.id === planId)
      if (plan && !plan.checked) {
        plan.checked = true
        plan.checkInTime = new Date().toISOString()
        return plan.points
      }
      return 0
    },
    generateBosses(planId: string) {
      const bosses = [
        { id: '1', name: '懒惰史莱姆', hp: 100, maxHp: 100, defeated: false },
        { id: '2', name: '拖延怪', hp: 150, maxHp: 150, defeated: false },
        { id: '3', name: '放弃魔王', hp: 200, maxHp: 200, defeated: false }
      ]
      return bosses
    }
  }
})