import { BASE_URL } from '@/config'
import type { BaseResponse, UploadImageVO } from '@/types/api'
import { getToken } from '@/utils/request'

interface UploadResult {
  url: string
  previewUrl: string
}

/** 从 Map<String,String> 响应里兼容地取原图/预览图 URL */
function pickUrls(map: UploadImageVO): UploadResult {
  const url = map.url ?? map.imageUrl ?? map.image ?? map.original ?? ''
  const previewUrl = map.previewUrl ?? map.preview ?? map.compressed ?? url
  return { url, previewUrl }
}

/** 通用图片上传（≤5MB jpg/jpeg/png/webp），返回 { url, previewUrl } */
export function uploadImage(filePath: string, name = 'file'): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/upload/image`,
      filePath,
      name,
      header: { Authorization: `Bearer ${getToken()}` },
      success: (res) => {
        try {
          const body = JSON.parse(res.data) as BaseResponse<UploadImageVO>
          if (body.code === 0 && body.data) {
            resolve(pickUrls(body.data))
            return
          }
          uni.showToast({ title: body.message || '上传失败', icon: 'none' })
          reject(new Error(body.message))
        } catch {
          uni.showToast({ title: '上传响应异常', icon: 'none' })
          reject(new Error('上传响应异常'))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，上传失败', icon: 'none' })
        reject(new Error(err.errMsg))
      }
    })
  })
}

/**
 * 死斗凭证上传：multipart 字段为 image，remark 走 query
 * 返回打卡结算结果 JSON
 */
export function uploadDuelProof<T>(duelId: number, filePath: string, remark?: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const query = remark ? `?remark=${encodeURIComponent(remark)}` : ''
    uni.uploadFile({
      url: `${BASE_URL}/duel/${duelId}/check_in${query}`,
      filePath,
      name: 'image',
      header: { Authorization: `Bearer ${getToken()}` },
      success: (res) => {
        try {
          const body = JSON.parse(res.data) as BaseResponse<T>
          if (body.code === 0) {
            resolve(body.data)
            return
          }
          uni.showToast({ title: body.message || '凭证上传失败', icon: 'none' })
          reject(new Error(body.message))
        } catch {
          uni.showToast({ title: '上传响应异常', icon: 'none' })
          reject(new Error('上传响应异常'))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，上传失败', icon: 'none' })
        reject(new Error(err.errMsg))
      }
    })
  })
}
