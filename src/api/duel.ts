import type {
  ApplicationsApproveAllVO,
  DuelCreateRequest,
  DuelVO,
  InviteInfoVO,
  HallDuelVO,
  HallPageVO,
  InviteUseResultVO,
  InviteVO,
  JoinApplicationReviewRequest,
  JoinRequestVO,
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

// ===== 邀请 / 加入申请 =====

/** 生成邀请海报（仅招募中的正式成员；每成员固定一个邀请码） */
export const getInvitePoster = (duelId: number) => post<InviteVO>(`/duel/${duelId}/invite`)

/** 邀请码落地信息（免登录） */
export const getInviteInfo = (code: string) =>
  get<InviteInfoVO>(`/duel/invite/info/${encodeURIComponent(code)}`)

/** 使用邀请码：组长码直接入组；成员码自由制直接入组、审批制提交申请 */
export const useInviteCode = (code: string) =>
  post<InviteUseResultVO>('/duel/invite/use', { code })

/** 申请加入（审批制死斗，不扣押金，批准时才扣） */
export const applyJoinDuel = (duelId: number) => post<void>(`/duel/${duelId}/apply`)

/** 组长：待审加入申请列表 */
export const getJoinApplications = (duelId: number) =>
  get<JoinRequestVO[]>(`/duel/${duelId}/applications`)

/** 组长：审批加入申请 */
export const reviewJoinApplication = (duelId: number, data: JoinApplicationReviewRequest) =>
  post<unknown>(`/duel/${duelId}/applications/review`, data)

/** 组长：一键通过全部加入申请（到人数上限即停，剩余保持待审） */
export const approveAllApplications = (duelId: number) =>
  post<ApplicationsApproveAllVO>(`/duel/${duelId}/applications/approve-all`)

/** 招募大厅：招募中+进行中的死斗分页（隐藏局除外）；分页字段为 current/pageSize */
export const getRecruitingHall = (current = 1, pageSize = 20) =>
  get<HallPageVO>('/duel/hall', { current, pageSize }, true)

// ===== 组长治理 / 弹劾 =====

/** 组长移除成员：招募中=全额退款；进行中=退剩余天数份额，缺勤份额入奖池 */
export const removeMember = (duelId: number, targetUserId: number) =>
  post<DuelVO>(`/duel/${duelId}/members/${targetUserId}/remove`)

/** 组长让渡组长：目标须为正式成员，即时生效 */
export const transferLeader = (duelId: number, targetUserId: number) =>
  post<DuelVO>(`/duel/${duelId}/transfer/${targetUserId}`)

/** 发起弹劾（仅进行中死斗的正式成员，非组长；原因 ≤20 字；发起人自动记 1 张弹劾票） */
export const impeachLeader = (duelId: number, reason: string) =>
  post<DuelVO>(`/duel/${duelId}/impeach`, { reason })

/** 弹劾投票：vote 0=维持 1=弹劾；一票定死不可改；弹劾票严格过半即成功 */
export const voteImpeachment = (duelId: number, impeachmentId: number, vote: 0 | 1) =>
  post<DuelVO>(`/duel/${duelId}/impeachment/vote`, { impeachmentId, vote })
