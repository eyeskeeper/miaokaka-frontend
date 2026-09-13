import type {
  CheckInCalendarVO,
  CheckInRequest,
  CheckInResultVO,
  MakeupResultVO
} from '@/types/api'
import { get, post } from '@/utils/request'

export const checkIn = (data: CheckInRequest) => post<CheckInResultVO>('/check_in', data)

/** 补卡：扣 50 喵币，自然月限 2 次，限补最近 30 天 */
export const makeupCheckIn = (planId: number, date: string) =>
  post<MakeupResultVO>('/check_in/makeup', { planId, date })

/** 打卡日历：month 格式 yyyy-MM，缺省当月 */
export const getCheckinCalendar = (planId: number, month?: string) =>
  get<CheckInCalendarVO>('/check_in/records', { planId, month })
