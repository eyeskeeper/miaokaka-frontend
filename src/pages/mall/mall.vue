<template>
  <view class="page">
    <!-- 我的积分 -->
    <view class="points-card pixel-card">
      <text class="points-label">当前积分</text>
      <text class="points-num">{{ totalPoints }}</text>
      <text class="points-tip">打卡赚积分，商城花积分</text>
    </view>

    <!-- 小鱼干 -->
    <view class="fish-card pixel-card">
      <text class="fish-icon">🐟</text>
      <text class="fish-num">小鱼干 × {{ driedFish }}</text>
      <button class="pixel-btn-sm" :disabled="driedFish <= 0 || exchanging" @tap="doExchange">1:1 兑积分</button>
    </view>

    <!-- 商品目录 -->
    <view class="pixel-card section">
      <text class="pixel-h2">🛒 商品目录</text>
      <view v-for="item in catalog" :key="item.code" class="item-row">
        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-desc">{{ item.description }}</text>
          <text class="item-owned">已持有 {{ item.owned }} 张</text>
        </view>
        <button
          class="pixel-btn-sm-green buy-btn"
          :loading="buyingCode === item.code"
          @tap="doBuy(item)"
        >
          {{ item.price }} 积分
        </button>
      </view>
    </view>

    <!-- 我的背包 -->
    <view class="pixel-card section">
      <text class="pixel-h2">🎒 我的背包</text>
      <view v-for="item in bag" :key="item.code" class="bag-row">
        <text class="bag-name">{{ item.name }}</text>
        <text class="bag-qty">× {{ item.quantity }}</text>
      </view>
      <text v-if="bag.length === 0" class="empty">背包空空如也，快去兑换道具吧</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { buyMallItem, exchangeFish, getMallBag, getMallCatalog } from '@/api/mall'
import { useUserStore } from '@/stores/user'
import type { BagItemVO, MallItemVO } from '@/types/api'

const userStore = useUserStore()

const catalog = ref<MallItemVO[]>([])
const bag = ref<BagItemVO[]>([])
const buyingCode = ref('')
const exchanging = ref(false)
const driedFish = ref(0)

const totalPoints = ref(userStore.userInfo?.totalPoints ?? 0)

onShow(() => {
  if (!ensureLogin()) return
  refresh()
})

function refresh() {
  getMallCatalog()
    .then((d) => (catalog.value = d || []))
    .catch(() => {})
  getMallBag()
    .then((d) => (bag.value = d || []))
    .catch(() => {})
  userStore.fetchMe().then(() => {
    totalPoints.value = userStore.userInfo?.totalPoints ?? 0
    driedFish.value = userStore.userInfo?.driedFish ?? 0
  })
}

async function doExchange() {
  if (driedFish.value <= 0 || exchanging.value) return
  exchanging.value = true
  try {
    driedFish.value = await exchangeFish(driedFish.value)
    userStore.fetchMe().then(() => {
      totalPoints.value = userStore.userInfo?.totalPoints ?? 0
    })
    uni.showToast({ title: '兑换成功', icon: 'success' })
  } catch {
    // 统一提示
  } finally {
    exchanging.value = false
  }
}

async function doBuy(item: MallItemVO) {
  if (buyingCode.value) return
  const ok = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '确认兑换',
      content: `花 ${item.price} 积分兑换「${item.name}」？`,
      success: (r) => resolve(!!r.confirm)
    })
  })
  if (!ok) return
  buyingCode.value = item.code
  try {
    const r = await buyMallItem({ itemCode: item.code })
    totalPoints.value = r.totalPoints
    uni.showToast({ title: '兑换成功', icon: 'success' })
    refresh()
  } catch {
    // 统一提示
  } finally {
    buyingCode.value = ''
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.points-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 32rpx 0;

  .points-label {
    font-size: 24rpx;
    color: $pixel-ink-light;
  }

  .points-num {
    font-size: 64rpx;
    font-weight: 700;
    color: $pixel-primary;
  }

  .points-tip {
    font-size: 22rpx;
    color: $pixel-ink-light;
  }
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx dashed $pixel-ink-light;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;

  .item-name {
    font-size: 28rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  .item-desc {
    font-size: 22rpx;
    color: $pixel-ink-light;
  }

  .item-owned {
    font-size: 22rpx;
    color: $pixel-ink-light;
  }
}

.buy-btn {
  flex-shrink: 0;
}

.bag-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;

  .bag-name {
    font-size: 26rpx;
    color: $pixel-ink;
  }

  .bag-qty {
    font-size: 26rpx;
    font-weight: 700;
    color: $pixel-primary;
  }
}

.empty {
  font-size: 24rpx;
  color: $pixel-ink-light;
  text-align: center;
  padding: 16rpx 0;
}

.fish-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;

  .fish-icon {
    font-size: 40rpx;
  }

  .fish-num {
    flex: 1;
    font-size: 28rpx;
    font-weight: 700;
    color: $pixel-ink;
  }
}

</style>
