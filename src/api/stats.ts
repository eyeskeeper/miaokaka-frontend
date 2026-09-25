import type { AchievementVO, HeatmapDayVO, WeeklyStatsVO } from '@/types/api'
import { get } from '@/utils/request'

/** 年度打卡热力图（正常+补卡，按日计数；不传年份默认当年） */
export const getHeatmap = (year?: number) =>
  get<HeatmapDayVO[]>('/check_in/stats/heatmap', year ? { year } : undefined)

/** 本周统计周报（周一~今天，含 AI 总结） */
export const getWeeklyStats = () => get<WeeklyStatsVO>('/check_in/stats/weekly')

/** 徽章墙：全部徽章 + 我的解锁状态 */
export const getAchievementWall = () => get<AchievementVO[]>('/check_in/achievements')
