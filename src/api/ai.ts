import type { AiPlanDraftRequest, AiPlanDraftVO } from '@/types/api'
import { get, post } from '@/utils/request'

/** AI 生成打卡计划草稿（不落库），确认后调 createPlan 正式创建 */
export const getPlanDraft = (description: string) =>
  post<AiPlanDraftVO>('/ai/plan/draft', { description } as AiPlanDraftRequest)

export const getAiHealth = () => get<string>('/ai/health', undefined, true)
