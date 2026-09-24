import type {
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  AdminUserPageQuery,
  AdminUserVO,
  PageData,
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
