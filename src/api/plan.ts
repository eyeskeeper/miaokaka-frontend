import type {
  PlanCreateRequest,
  PlanUpdateRequest,
  PlanVO,
  TaskToggleVO
} from '@/types/api'
import { get, post } from '@/utils/request'

export const createPlan = (data: PlanCreateRequest) => post<PlanVO>('/plan', data)

export const updatePlan = (data: PlanUpdateRequest) => post<PlanVO>('/plan/update', data)

export const deletePlan = (id: number) => post<unknown>('/plan/delete', { id })

export const getPlanList = () => get<PlanVO[]>('/plan/list')

export const getPlanDetail = (planId: number) => get<PlanVO>(`/plan/${planId}`)

export const renameCat = (planId: number, catName: string) =>
  post<unknown>('/plan/cat/name', { planId, catName })

export const toggleTask = (planId: number, taskIndex: number, done: boolean) =>
  post<TaskToggleVO>(`/plan/${planId}/task/toggle`, { taskIndex, done })
