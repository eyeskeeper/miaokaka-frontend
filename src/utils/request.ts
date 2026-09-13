import { BASE_URL } from '@/config'
import type { BaseResponse } from '@/types/api'
import { storage } from '@/utils/storage'

const TOKEN_KEY = 'token'

export const getToken = (): string => storage.get<string>(TOKEN_KEY) ?? ''
export const setToken = (token: string) => storage.set(TOKEN_KEY, token)
export const clearToken = () => storage.remove(TOKEN_KEY)

let redirectingLogin = false

function gotoLogin() {
  if (redirectingLogin) return
  redirectingLogin = true
  setTimeout(() => {
    redirectingLogin = false
    uni.reLaunch({ url: '/pages/login/login' })
  }, 600)
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  /** 失败时不弹全局 toast，由调用方自行处理 */
  quiet?: boolean
}

/**
 * 请求封装：自动携带 token、解包 BaseResponse、统一错误提示
 * code=0 成功；40100 未登录 → 清 token 回登录页
 */
export function request<T>(options: RequestOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method ?? 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      success: (res) => {
        const body = res.data as BaseResponse<T>
        if (body && typeof body === 'object' && 'code' in body) {
          if (body.code === 0) {
            resolve(body.data)
            return
          }
          if (body.code === 40100) {
            clearToken()
            if (!options.quiet) uni.showToast({ title: '请先登录', icon: 'none' })
            gotoLogin()
            reject(new Error(body.message))
            return
          }
          if (!options.quiet) {
            uni.showToast({ title: body.message || '请求失败', icon: 'none' })
          }
          reject(new Error(body.message))
          return
        }
        if (!options.quiet) uni.showToast({ title: '响应格式异常', icon: 'none' })
        reject(new Error('响应格式异常'))
      },
      fail: (err) => {
        if (!options.quiet) uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(new Error(err.errMsg))
      }
    })
  })
}

export const get = <T>(url: string, data?: Record<string, any>, quiet?: boolean) =>
  request<T>({ url, method: 'GET', data, quiet })

export const post = <T>(url: string, data?: Record<string, any>, quiet?: boolean) =>
  request<T>({ url, method: 'POST', data, quiet })

export const put = <T>(url: string, data?: Record<string, any>, quiet?: boolean) =>
  request<T>({ url, method: 'PUT', data, quiet })
