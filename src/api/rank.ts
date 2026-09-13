import type { StreakRankVO } from '@/types/api'
import { get } from '@/utils/request'

/** 全勤连击 Top50 + 我的真实排名 */
export const getStreakRank = () => get<StreakRankVO>('/rank/streak')
