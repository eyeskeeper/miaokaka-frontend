/**
 * 后端接口类型定义（对齐 OpenAPI 文档）
 * 文档地址: http://localhost:18089/api/v3/api-docs
 */

// ===== 通用 =====

export interface BaseResponse<T> {
  code: number
  message: string
  data: T
}

/** MyBatis-Plus 分页结构 */
export interface PageData<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages?: number
}

// ===== 用户 / 认证 =====

export interface LoginUserVO {
  id: number
  userAccount: string
  userName: string
  userAvatar: string | null
  userProfile: string | null
  userRole: string
  currentStreak: number
  totalPoints: number
  createTime: string
}

export interface LoginResponseVO {
  token: string
  user: LoginUserVO
}

export interface UserLoginRequest {
  userAccount: string
  userPassword: string
}

export interface UserRegisterRequest {
  userAccount: string
  userPassword: string
  checkPassword: string
}

// ===== 打卡计划 & 猫精灵 =====

export interface CatVO {
  id: number
  planId: number
  catName: string
  catAvatar: string | null
  /** 随机类型，决定前端像素猫配色 */
  catType: number
  level: number
  experience: number
  expToNextLevel: number
  attack: number
  defense: number
  maxHp: number
  currentHp: number
  bossLevel: number
  bossName: string
  bossHp: number
  bossMaxHp: number
  totalBossDefeated: number
  createTime: string
}

export interface PlanVO {
  id: number
  planName: string
  planDesc: string | null
  planType: number
  targetDays: number
  remindTime: string | null
  dailyTasks: string[] | null
  /** 0 进行中 1 已暂停 */
  status: number
  currentStreak: number
  maxStreak: number
  todayChecked: boolean
  cat: CatVO | null
  createTime: string
}

export interface PlanCreateRequest {
  planName: string
  planDesc?: string
  planType?: number
  targetDays?: number
  /** HH:mm 或空串 */
  remindTime?: string
  /** 最多 5 项每日任务 */
  dailyTasks?: string[]
}

export interface PlanUpdateRequest {
  id: number
  planName?: string
  planDesc?: string
  planType?: number
  targetDays?: number
  /** HH:mm 或空串 */
  remindTime?: string
  dailyTasks?: string[]
  /** 仅允许 0/1 切换 */
  status?: number
}

// ===== 打卡 =====

export interface CheckInRequest {
  planId: number
  remark?: string
}

export interface CheckInMakeupRequest {
  planId: number
  /** yyyy-MM-dd */
  date: string
}

export interface CheckInResultVO {
  catName: string
  checkInDate: string
  remark: string | null
  eventType: string
  eventDesc: string
  damage: number
  bossDefeated: boolean
  bossName: string
  bossHpBefore: number
  bossHpAfter: number
  newBossLevel: number
  newBossName: string
  newBossMaxHp: number
  statName: string
  statGain: number
  expGained: number
  level: number
  levelUp: boolean
  pointsEarned: number
  totalPoints: number
  currentStreak: number
  maxStreak: number
  encouragement: string
}

export interface MakeupResultVO {
  checkInDate: string
  pointsCost: number
  totalPoints: number
  currentStreak: number
  maxStreak: number
}

export interface DayRecord {
  date: string
  /** 1 已打卡 2 补卡 其余视为未打卡 */
  status: number
  remark: string | null
}

export interface CheckInCalendarVO {
  planId: number
  month: string
  days: DayRecord[]
}

export interface TaskToggleVO {
  planId: number
  taskIndex: number
  done: boolean
  taskProgress: string
  completedTasks: number
  totalTasks: number
  allDone: boolean
  autoChecked: boolean
  checkInResult: CheckInResultVO | null
  message: string
}

// ===== 习惯死斗 =====

export interface DuelCreateRequest {
  duelName: string
  duelDesc?: string
  /** 玩法模式：0 押金死斗（默认）1 组队打卡（无押金，进行中可自由进出） */
  mode?: number
  /** 每日任务清单（≤5 项），复制到成员影子计划；缺省为无清单局 */
  dailyTasks?: string[]
  /** 2 ~ 50 */
  maxMembers: number
  /** 隐藏局：不进招募大厅，仅组号/邀请海报可发现 */
  hidden?: boolean
  /** 100 ~ 5000；组队打卡不传（后端存 0） */
  depositPerMember?: number
  /** 3 ~ 365 */
  totalDays: number
  /** yyyy-MM-dd，最早为明天 */
  startDate?: string
  /** 0 自由加入 1 需组长审核 */
  joinMode?: number
}

export interface MemberVO {
  userId: number
  userName: string
  userAvatar: string | null
  isLeader: boolean
  days: number
  deposit: number
  status: number
}

/** 进行中的弹劾（已结束的不下发） */
export interface ImpeachmentVO {
  id: number
  initiatorId: number
  initiatorName: string
  /** 弹劾原因（20 字内） */
  reason: string
  impeachCount: number
  maintainCount: number
  /** 投票基数（当前正式成员数，弹劾票严格过半即成功） */
  totalCount: number
  /** 投票截止时间 */
  expireTime: string
}

export interface DuelVO {
  id: number
  duelName: string
  duelDesc: string | null
  leaderId: number
  /** 0 押金死斗 1 组队打卡（无押金，进行中可自由进出） */
  mode: number
  /** 0 自由加入 1 需审批 */
  joinMode: number
  /** 隐藏局：不进招募大厅，仅组号/邀请海报可发现 */
  hidden: boolean
  /** 人数上限（2~50） */
  maxMembers: number
  depositPerMember: number
  totalDays: number
  startDate: string
  endDate: string
  /** 0 招募中 1 进行中 2 已结束 */
  status: number
  memberCount: number
  totalPool: number
  settled: boolean
  myRole: string
  myStatus: number
  myPlanId: number | null
  pendingCount: number
  /** 我的加入申请状态：null 无申请 / 0 待审 / 1 已通过 / 2 已拒绝 */
  myApplyStatus: number | null
  /** 我对进行中弹劾的投票：null 未投 / 0 维持 / 1 弹劾 */
  myImpeachVote: number | null
  /** 进行中的弹劾（无则 null） */
  impeachment: ImpeachmentVO | null
  /** 死斗每日任务清单（复制到成员影子计划），无清单局为 null */
  dailyTasks: string[] | null
  members: MemberVO[]
}

export interface ReviewItemVO {
  recordId: number
  userId: number
  userName: string
  userAvatar: string | null
  imageUrl: string
  previewUrl: string
  checkInDate: string
  remark: string | null
  /** AI 预审建议 */
  aiSuggestion: number
  aiReason: string | null
}

// ===== 拍一拍 =====

export interface NudgeTemplateVO {
  nudgeText: string
  effectiveText: string
}

export interface NudgeSentVO {
  toUserId: number
  text: string
  dailyRemaining: number
}

export interface NudgeItemVO {
  fromUserId: number
  fromUserName: string
  text: string
  time: string
}

export interface NudgeInboxVO {
  count: number
  items: NudgeItemVO[]
}

// ===== 通知消息 =====

/** 用户通知（拉取式持久消息，type 区分业务） */
export interface NotificationVO {
  id: number
  /** 见后端 NotificationConstant：1=被移除出死斗，后续扩展 */
  type: number
  title: string
  content: string
  /** 关联业务 id（死斗 id 等），可空 */
  refId: number | null
  isRead: boolean
  createTime: string
}

export interface NotificationPageVO {
  records: NotificationVO[]
  total: number
  current: number
  size: number
  pages: number
}

// ===== 邀请 / 加入申请 =====

/** 生成邀请海报（每成员每死斗固定一个邀请码） */
export interface InviteVO {
  code: string
  /** 相对路径，需拼后端域名（BASE_URL） */
  posterUrl: string
  duelName: string
  inviterName: string
  /** 二维码编码内容（后端落地 URL） */
  qrContent: string
}

/** 邀请码落地信息（免登录） */
export interface InviteInfoVO {
  duelId: number
  duelName: string
  leaderName: string
  /** 0 自由加入 1 需审批 */
  joinMode: number
  depositPerMember: number
  totalDays: number
  memberCount: number
  status: number
  inviterName: string
  leaderInvite: boolean
  /** direct=直接加入 apply=需审批 */
  joinAction: string
}

export interface InviteUseRequest {
  code: string
}

export interface InviteUseResultVO {
  /** direct=已直接加入 apply=已提交申请 */
  action: string
  duel: DuelVO
}

/** 招募大厅条目（GET /duel/hall） */
export interface HallDuelVO {
  id: number
  duelName: string
  duelDesc: string | null
  /** 0 押金死斗 1 组队打卡（无押金） */
  mode: number
  /** 0 自由加入 1 需审批 */
  joinMode: number
  leaderId: number
  leaderName: string
  memberCount: number
  depositPerMember: number
  totalDays: number
  status: number
  startDate: string
  endDate: string
  /** null=未加入 'leader'=我是组长 其他=已加入 */
  myRelation: string | null
}

export interface HallPageVO {
  records: HallDuelVO[]
  total: number
  current: number
  size: number
  pages: number
}

/** 组长视角的加入申请 */
export interface JoinRequestVO {
  id: number
  userId: number
  userName: string
  userAvatar: string | null
  createTime: string
}

export interface JoinApplicationReviewRequest {
  requestId: number
  approve: boolean
  remark?: string
}

/** 一键通过全部加入申请的结果（到人数上限即停，剩余保持待审） */
export interface ApplicationsApproveAllVO {
  approved: number
  rejected: number
  skipped: number
}

// ===== 喵币钱包 =====

export interface CoinTransaction {
  id: number
  userId: number
  type: number
  amount: number
  balanceAfter: number
  bizId: number | null
  remark: string
  createTime: string
}

export interface WalletVO {
  balance: number
  transactions: PageData<CoinTransaction>
}

// ===== 排行榜 =====

export interface RankItemVO {
  rank: number
  userId: number
  userName: string
  userAvatar: string | null
  currentStreak: number
}

/** GET /rank/streak 响应：Top50 榜单 + 当前用户真实排名（未上榜为 null） */
export interface StreakRankVO {
  list: RankItemVO[]
  myRank: number | null
}

// ===== AI 助手 =====

export interface AiPlanDraftRequest {
  /** 一句话描述，≤500 */
  description: string
}

export interface AiPlanDraftVO {
  planName: string
  planType: number
  planDesc: string
  targetDays: number
  dailyTasks: string[]
}

/** /upload/image 返回 Map<String,String>，键名以实际为准 */
export type UploadImageVO = Record<string, string>

// ===== 管理端（仅 admin 角色，后端 @AuthCheck 双保险）=====

export interface AdminUserVO {
  id: number
  userAccount: string
  userName: string
  userAvatar: string | null
  /** user / admin */
  userRole: string
  currentStreak: number
  totalPoints: number
  createTime: string
}

export interface AdminUserCreateRequest {
  /** 4~32 位 */
  userAccount: string
  /** 8~32 位，BCrypt 落库，注册赠 1000 喵币 */
  initialPassword: string
  /** 可选，默认随机喵友号 */
  userName?: string
}

export interface AdminUserUpdateRequest {
  userName?: string
  userAvatar?: string
  /** 仅允许 user / admin */
  userRole?: string
  /** 留空不修改；8~32 位 */
  newPassword?: string
}

export interface AdminUserPageQuery {
  current?: number
  pageSize?: number
  /** 昵称模糊搜索 */
  userName?: string
  /** 角色过滤（可选） */
  userRole?: string
}

export interface UserBanRequest {
  userId: number
  /** true=封禁 false=解封 */
  isBan: boolean
}
