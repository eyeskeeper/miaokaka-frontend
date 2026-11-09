import type {
  AppealPendingVO,
  ApplicationsApproveAllVO,
  DuelCreateRequest,
  DuelUpdateRequest,
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
  ReviewHistoryVO,
  ReviewItemVO
} from '@/types/api'
import type { CheckInResultVO } from '@/types/api'
import { get, post, put } from '@/utils/request'

export const createDuel = (data: DuelCreateRequest) => post<DuelVO>('/duel', data)

/** 招募期修改审核设置（仅组长，开赛锁定） */
export const updateDuelSettings = (duelId: number, data: DuelUpdateRequest) =>
  put<DuelVO>(`/duel/${duelId}`, data)

export const joinDuel = (duelId: number) => post<DuelVO>(`/duel/${duelId}/join`)

export const getDuelList = () => get<DuelVO[]>('/duel/list')

export const getDuelDetail = (duelId: number) => get<DuelVO>(`/duel/${duelId}`)

/** 拍一拍：同死斗成员互拍，每日限 5 次 */
export const nudgeMember = (duelId: number, targetUserId: number) =>
  post<NudgeSentVO>(`/duel/${duelId}/nudge/${targetUserId}`)

/** 组长审核凭证；驳回必须给 reviewRemark */
export const reviewProof = (duelId: number, recordId: number, approve: boolean, reviewRemark?: string) =>
  post<CheckInResultVO>(`/duel/${duelId}/review`, { recordId, approve, reviewRemark })

/** 待审凭证：互审局 mine=派给我的（默认）；all=全队只读（仅组长） */
export const getPendingReviews = (duelId: number, scope: 'mine' | 'all' = 'mine') =>
  get<ReviewItemVO[]>(`/duel/${duelId}/review/pending`, { scope })

/** 审核记录（组内公示，最近 50 条） */
export const getReviewHistory = (duelId: number) =>
  get<ReviewHistoryVO[]>(`/duel/${duelId}/review/history`)

// ===== 上诉 / 举报（救济通道，仅针对驳回） =====

/** 上诉：互审局本人被驳回凭证，48h 内每凭证一次，交组长仲裁 */
export const appealEvidence = (duelId: number, evidenceId: number, reason: string) =>
  post<number>(`/duel/${duelId}/appeal`, { evidenceId, reason })

/** 组长（互审局）待仲裁上诉列表 */
export const getPendingAppeals = (duelId: number) =>
  get<AppealPendingVO[]>(`/duel/${duelId}/appeal/pending`)

/** 组长仲裁：改判通过（补钱+补事件结算）/ 维持驳回 */
export const resolveAppeal = (duelId: number, appealId: number, approve: boolean, remark?: string) =>
  post<CheckInResultVO | null>(`/duel/${duelId}/appeal/resolve`, { appealId, approve, remark })

/** 举报死斗：组长局驳回直报；互审局须上诉被维持后；每人每局一次 */
export const reportDuel = (duelId: number, evidenceId: number, reason: string) =>
  post<number>(`/duel/${duelId}/report`, { evidenceId, reason })

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

// ===== 组队共享 BOSS 字段已并入 DuelVO（bossLevel/bossName/bossHp/bossMaxHp/bossKilled/bossQuota） =====
