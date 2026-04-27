import { defineStore } from 'pinia'

export interface CatAppearance {
  color: string // orange, white, black, etc.
  style: string // normal, cute, cool, etc.
}

export interface CatAttributes {
  strength: number    // 力量
  agility: number     // 敏捷
  intelligence: number // 智力
}

export interface Cat {
  id: string
  name: string
  level: number
  exp: number
  maxExp: number
  points: number
  attributes: CatAttributes
  appearance: CatAppearance
  battles: string[] // 今日战斗记录
  isActive: boolean // 是否为当前激活的猫咪
}

export const useCatStore = defineStore('cat', {
  state: () => ({
    cats: [] as Cat[],
    currentCatId: '' as string
  }),
  getters: {
    // 当前激活的猫咪
    currentCat: (state): Cat | null => {
      return state.cats.find(cat => cat.id === state.currentCatId) || state.cats[0] || null
    },
    // 总积分
    totalPoints: (state): number => {
      return state.cats.reduce((sum, cat) => sum + cat.points, 0)
    }
  },
  actions: {
    // 初始化默认猫咪
    initializeDefaultCats() {
      if (this.cats.length === 0) {
        this.cats = [
          {
            id: 'cat_1',
            name: '小橘猫',
            level: 1,
            exp: 0,
            maxExp: 100,
            points: 0,
            attributes: {
              strength: 10,
              agility: 10,
              intelligence: 10
            },
            appearance: {
              color: 'orange',
              style: 'normal'
            },
            battles: [],
            isActive: true
          },
          {
            id: 'cat_2',
            name: '小白猫',
            level: 1,
            exp: 0,
            maxExp: 100,
            points: 0,
            attributes: {
              strength: 8,
              agility: 12,
              intelligence: 10
            },
            appearance: {
              color: 'white',
              style: 'cute'
            },
            battles: [],
            isActive: false
          }
        ]
        this.currentCatId = 'cat_1'
      }
    },

    // 添加新猫咪
    addCat(cat: Omit<Cat, 'id'>): string {
      const newCat: Cat = {
        ...cat,
        id: 'cat_' + Date.now()
      }
      this.cats.push(newCat)
      return newCat.id
    },

    // 删除猫咪
    deleteCat(catId: string) {
      if (this.cats.length <= 1) {
        uni.showToast({
          title: '至少保留一只猫咪',
          icon: 'none'
        })
        return false
      }
      const index = this.cats.findIndex(cat => cat.id === catId)
      if (index > -1) {
        this.cats.splice(index, 1)
        // 如果删除的是当前猫咪，切换到第一只
        if (this.currentCatId === catId) {
          this.currentCatId = this.cats[0].id
        }
        return true
      }
      return false
    },

    // 切换当前猫咪
    switchCat(catId: string) {
      const cat = this.cats.find(c => c.id === catId)
      if (cat) {
        // 更新所有猫咪的激活状态
        this.cats.forEach(c => c.isActive = false)
        cat.isActive = true
        this.currentCatId = catId
        return true
      }
      return false
    },

    // 根据ID获取猫咪
    getCatById(catId: string): Cat | null {
      return this.cats.find(cat => cat.id === catId) || null
    },

    // 为指定猫咪添加积分
    addPointsToCat(catId: string, amount: number) {
      const cat = this.getCatById(catId)
      if (cat) {
        cat.points += amount
        cat.exp += amount
        if (cat.exp >= cat.maxExp) {
          this.levelUpCat(catId)
        }
      }
    },

    // 指定猫咪升级
    levelUpCat(catId: string) {
      const cat = this.getCatById(catId)
      if (cat) {
        cat.level++
        cat.exp = cat.exp - cat.maxExp
        cat.maxExp = Math.floor(cat.maxExp * 1.2)
        cat.attributes.strength += 2
        cat.attributes.agility += 2
        cat.attributes.intelligence += 2
      }
    },

    // 升级指定猫咪的属性
    upgradeAttribute(catId: string, type: 'strength' | 'agility' | 'intelligence', cost: number) {
      const cat = this.getCatById(catId)
      if (cat && cat.points >= cost) {
        cat.points -= cost
        cat.attributes[type] += 5
        return true
      }
      return false
    },

    // 更新猫咪信息
    updateCat(catId: string, updates: Partial<Cat>) {
      const cat = this.getCatById(catId)
      if (cat) {
        Object.assign(cat, updates)
        return true
      }
      return false
    },

    // 添加战斗记录
    addBattleRecord(catId: string, record: string) {
      const cat = this.getCatById(catId)
      if (cat) {
        cat.battles.push(record)
        // 只保留最近10条记录
        if (cat.battles.length > 10) {
          cat.battles.shift()
        }
      }
    }
  }
})
