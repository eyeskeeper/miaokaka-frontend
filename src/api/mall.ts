import type { BagItemVO, MallBuyRequest, MallBuyResultVO, MallItemVO } from '@/types/api'
import { get, post } from '@/utils/request'

/** 商品目录（含我的持有数量） */
export const getMallCatalog = () => get<MallItemVO[]>('/mall/catalog')

/** 我的背包 */
export const getMallBag = () => get<BagItemVO[]>('/mall/bag')

/** 购买道具（原子扣积分） */
export const buyMallItem = (data: MallBuyRequest) =>
  post<MallBuyResultVO>('/mall/buy', data)
