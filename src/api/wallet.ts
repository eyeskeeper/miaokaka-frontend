import type { WalletVO } from '@/types/api'
import { get } from '@/utils/request'

/** 余额与流水：注册赠 1000 */
export const getWallet = (current = 1, pageSize = 10) =>
  get<WalletVO>('/wallet', { current, pageSize })
