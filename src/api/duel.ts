import type {
  DuelCreateRequest,
  DuelVO,
  MemberVO,
  NudgeInboxVO,
  NudgeSentVO,
  NudgeTemplateVO,
  ReviewItemVO
} from '@/types/api'
import type { CheckInResultVO } from '@/types/api'
import { get, post, put } from '@/utils/request'

export const createDuel = (data: DuelCreateRequest) => post<DuelVO>('/duel', data)

export const joinDuel = (duelId: number) => post<DuelVO>(`/duel/${duelId}/join`)

export const quitDuel = (duelId: number) => post<DuelVO>(`/duel/${duelId}/quit`)

export const getDuelList = () => get<DuelVO[]>('/duel/list')

export const getDuelDetail = (duelId: number) => get<DuelVO>(`/duel/${duelId}`)

/** 拍一拍：同死斗成员互拍，每日限 5 次 */
export const nudgeMember = (duelId: number, targetUserId: number) =>
  post<NudgeSentVO>(`/duel/${duelId}/nudge/${targetUserId}`)

/** 组长审核凭证；驳回必须给 reviewRemark */
export const reviewProof = (duelId: number, recordId: number, approve: boolean, reviewRemark?: string) =>
  post<CheckInResultVO>(`/duel/${duelId}/review`, { recordId, approve, reviewRemark })

export const getPendingReviews = (duelId: number) =>
  get<ReviewItemVO[]>(`/duel/${duelId}/review/pending`)

/** 我的待收拍一拍：读取即消费 */
export const getMyNudges = () => get<NudgeInboxVO>('/nudge/mine')

export const getNudgeTemplate = () => get<NudgeTemplateVO>('/nudge/template')

export const saveNudgeTemplate = (nudgeText: string) =>
  put<NudgeTemplateVO>('/nudge/template', { nudgeText })
