import { get, put } from '@/utils/request'
import type { NotificationPageVO } from '@/types/api'

/** 我的通知分页（id 倒序，pageSize 上限 50；读取不清空已读状态） */
export const getNotifications = (current = 1, pageSize = 20) =>
  get<NotificationPageVO>('/notification/list', { current, pageSize })

/** 未读通知数（角标用） */
export const getUnreadCount = () => get<number>('/notification/unread-count', undefined, true)

/** 标记单条已读（幂等） */
export const markNotificationRead = (notificationId: number) =>
  put<boolean>(`/notification/read/${notificationId}`)

/** 全部标记已读，返回本次标记条数 */
export const markAllNotificationsRead = () => put<number>('/notification/read-all')
