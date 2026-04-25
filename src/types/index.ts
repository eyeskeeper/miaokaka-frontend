// 用户类型
export interface User {
  userId: string
  nickname: string
  avatar: string
  phone: string
  token: string
  isLoggedIn: boolean
}

// 猫咪类型
export interface Cat {
  id: string
  name: string
  level: number
  exp: number
  maxExp: number
  points: number
  attributes: {
    strength: number
    agility: number
    intelligence: number
  }
  appearance: {
    color: string
    style: string
  }
}

// 计划类型
export interface Plan {
  id: string
  title: string
  description: string
  points: number
  checked: boolean
  checkInTime?: string
  bosses: Boss[]
}

// Boss 类型
export interface Boss {
  id: string
  name: string
  hp: number
  maxHp: number
  defeated: boolean
}

// 排行榜类型
export interface RankItem {
  userId: string
  nickname: string
  avatar: string
  points: number
  rank: number
}