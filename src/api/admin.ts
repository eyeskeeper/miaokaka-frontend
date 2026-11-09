import type {
  AdminStatsVO,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  AdminUserPageQuery,
  AdminUserVO,
  AnnouncementCreateRequest,
  AnnouncementVO,
  PageData,
  ReportAdminVO,
  UserBanRequest
} from '@/types/api'
import { del, get, post, put } from '@/utils/request'

/** 分页查用户：昵称模糊 + 角色过滤 */
export const pageAdminUsers = (query: AdminUserPageQuery) =>
  get<PageData<AdminUserVO>>('/admin/user/page', query as unknown as Record<string, any>)

/** 建号：赠 1000 喵币，返回新用户 id */
export const createAdminUser = (data: AdminUserCreateRequest) =>
  post<number>('/admin/user', data)

/** 用户详情 */
export const getAdminUserDetail = (userId: number) =>
  get<AdminUserVO>(`/admin/user/${userId}`)

/** 修改用户：patch 语义，仅更新传入字段 */
export const updateAdminUser = (userId: number, data: AdminUserUpdateRequest) =>
  put<AdminUserVO>(`/admin/user/${userId}`, data)

/** 删除用户（逻辑删除 + 账号归档；名下有招募中/进行中死斗押金时拒绝） */
export const deleteAdminUser = (userId: number) =>
  del<string>(`/admin/user/${userId}`)

/** 封禁/解封（封禁后逐出登录态缓存，立即生效） */
export const banAdminUser = (data: UserBanRequest) =>
  post<boolean>('/admin/user/ban', data)

/** 发布公告（广播到全员通知中心），返回 {announcementId, delivered} */
export const createAnnouncement = (data: AnnouncementCreateRequest) =>
  post<Record<string, number>>('/admin/announcement', data as unknown as Record<string, unknown>)

/** 公告历史（最新在前） */
export const getAnnouncements = (current = 1, pageSize = 20) =>
  get<PageData<AnnouncementVO>>('/admin/announcements', { current, pageSize })

/** 数据看板：用户/打卡/局数统计 + 近 7 天趋势 */
export const getAdminStats = () => get<AdminStatsVO>('/admin/stats')

/** 举报分页（含凭证/审核/上诉链）；状态 0待处理 1改判 2维持 3无法处理 */
export const getReportPage = (current = 1, pageSize = 20, status?: number) =>
  get<PageData<ReportAdminVO>>('/admin/report/page', { current, pageSize, status })

/** 处理举报：改判通过（补钱+补事件结算，仅进行中局且提交者在册）/ 维持原判 */
export const resolveReport = (reportId: number, approve: boolean, remark?: string) =>
  post<unknown>(`/admin/report/${reportId}/resolve`, { approve, remark })
