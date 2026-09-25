import type {
  FriendApplicationVO,
  FriendCatVO,
  FriendFeedItemVO,
  FriendRankItemVO,
  FriendSearchVO,
  FriendVO
} from '@/types/api'
import { del, get, post } from '@/utils/request'

export const applyFriend = (targetUserId: number) =>
  post<boolean>('/friend/apply', { targetUserId })

export const getFriendApplications = () =>
  get<FriendApplicationVO[]>('/friend/applications')

export const agreeFriendApplication = (id: number) =>
  post<boolean>('/friend/agree', { id })

export const rejectFriendApplication = (id: number) =>
  post<boolean>('/friend/reject', { id })

export const getFriendList = () => get<FriendVO[]>('/friend/list')

export const removeFriend = (friendUserId: number) =>
  del<boolean>(`/friend/${friendUserId}`)

export const searchUser = (keyword: string) =>
  get<FriendSearchVO>('/friend/search', { keyword }, true)

export const getFriendRank = () => get<FriendRankItemVO[]>('/friend/rank')

export const getFriendFeed = () => get<FriendFeedItemVO[]>('/friend/feed')

export const getFriendCats = (friendId: number) =>
  get<FriendCatVO>(`/friend/${friendId}/cats`)

export const getFriendCalendar = (friendId: number, planId: number, month?: string) =>
  get<import('@/types/api').CheckInCalendarVO>(`/friend/${friendId}/calendar`, { planId, month })

export const likeCheckIn = (recordId: number) =>
  post<{ likeCount: number }>(`/friend/like/${recordId}`)
