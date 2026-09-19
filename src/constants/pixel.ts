/**
 * 展示映射与像素素材路径（后端枚举语义不确定的字段统一在此映射，便于调整）
 */
import type { CatVO } from '@/types/api'

// ===== 计划类型 =====

export const PLAN_TYPES = [
  { value: 0, label: '学习', icon: '📚' },
  { value: 1, label: '运动', icon: '🏃' },
  { value: 2, label: '生活', icon: '🏡' },
  { value: 3, label: '其他', icon: '✨' }
]

export const planTypeLabel = (type: number) =>
  PLAN_TYPES.find((t) => t.value === type)?.label ?? '其他'

export const planTypeIcon = (type: number) =>
  PLAN_TYPES.find((t) => t.value === type)?.icon ?? '✨'

// ===== 像素猫 =====

const CAT_COLORS = ['orange', 'white', 'black', 'gray', 'calico'] as const

export type CatPose = 'idle' | 'happy' | 'attack'

/** catType → 像素猫配色图 */
export function pixelCat(catType: number | undefined | null, pose: CatPose = 'idle'): string {
  const color = CAT_COLORS[Math.abs(catType ?? 0) % CAT_COLORS.length]
  return `/static/pixel/cat-${color}-${pose}.png`
}

export const catAvatarOf = (cat: CatVO | null | undefined): string =>
  cat ? pixelCat(cat.catType) : pixelCat(0)

// ===== BOSS =====

const BOSS_SPRITES = ['slime', 'bat', 'ghost', 'demon'] as const

export function bossSprite(bossLevel: number | undefined | null): string {
  const idx = Math.max(0, (bossLevel ?? 1) - 1) % BOSS_SPRITES.length
  return `/static/pixel/boss-${BOSS_SPRITES[idx]}.png`
}

// ===== 死斗状态 =====

export const DUEL_STATUS = {
  recruiting: 0,
  ongoing: 1,
  ended: 2
} as const

export const duelStatusLabel = (status: number) =>
  ({ 0: '招募中', 1: '进行中', 2: '已结算', 3: '已解散' } as Record<number, string>)[status] ?? '未知'

// ===== 成员打卡状态（死斗）=====

export const memberStatusLabel = (status: number) =>
  ({ 0: '今日未打卡', 1: '今日已打卡', 2: '已淘汰', 3: '待审核' } as Record<number, string>)[status] ?? ''

// ===== 日历打卡状态（对齐后端 CheckInConstant.RECORD_STATUS_*）=====

export const DAY_STATUS = {
  /** 已打卡 */
  checked: 0,
  /** 补卡 */
  makeup: 1,
  /** 异常（死斗驳回等） */
  abnormal: 2,
  /** 待审核（死斗凭证） */
  pending: 3
} as const

// ===== AI 预审建议 =====

export const aiSuggestionLabel = (suggestion: number) =>
  ({ 1: 'AI 建议通过', 0: 'AI 建议人工复核', [-1]: 'AI 建议驳回' } as Record<number, string>)[suggestion] ?? ''
