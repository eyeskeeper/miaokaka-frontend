import type {
  AchievementVO,
  CheckInCalendarVO,
  CheckInRequest,
  CheckInResultVO,
  MakeupResultVO
} from '@/types/api'
import { get, post } from '@/utils/request'

export const checkIn = (data: CheckInRequest) => post<CheckInResultVO>('/check_in', data)

/** 补卡：扣 50 积分（可选用补卡券免扣），自然月限 2 次，限补最近 30 天 */
export const makeupCheckIn = (planId: number, date: string, useVoucher?: boolean) =>
  post<MakeupResultVO>('/check_in/makeup', { planId, date, useVoucher })

/** 徽章墙：全部徽章 + 我的解锁状态 */
export const getAchievementWall = () => get<AchievementVO[]>('/check_in/achievements')

/** 打卡日历：month 格式 yyyy-MM，缺省当月 */
export const getCheckinCalendar = (planId: number, month?: string) =>
  get<CheckInCalendarVO>('/check_in/records', { planId, month })
