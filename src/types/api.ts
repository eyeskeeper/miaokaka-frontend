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
  /** 100 ~ 5000 */
  depositPerMember: number
  /** 3 ~ 365 */
  totalDays: number
  /** yyyy-MM-dd，缺省明天开赛 */
  startDate?: string
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

export interface DuelVO {
  id: number
  duelName: string
  duelDesc: string | null
  leaderId: number
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
