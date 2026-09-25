import type { PageData, TemplateCreateRequest, TemplateVO } from '@/types/api'
import { del, get, post } from '@/utils/request'

/** 模板市场：官方置顶 → 使用量 → 最新（每页 20） */
export const getTemplateMarket = (current = 1) =>
  get<PageData<TemplateVO>>('/template/market', { current })

/** 创建模板（admin 创建自动为官方；AI 草稿字段可直接映射提交） */
export const createTemplate = (data: TemplateCreateRequest) =>
  post<number>('/template', data)

/** 删除模板（仅创建者或管理员） */
export const removeTemplate = (templateId: number) =>
  del<boolean>(`/template/${templateId}`)
