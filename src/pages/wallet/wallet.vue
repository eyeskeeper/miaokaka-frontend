<template>
  <view class="wallet">
    <!-- 余额卡 -->
    <view class="balance-card pixel-card">
      <text class="balance-label">当前喵币</text>
      <view class="balance-row">
        <image class="pixelated balance-coin" src="/static/pixel/icon-coin.png" />
        <text class="balance-num">{{ walletStore.balance }}</text>
      </view>
      <text class="balance-tip">打卡赚币 · 死斗押金/奖池走这里</text>
    </view>

    <!-- 流水 -->
    <view class="tx-card pixel-card">
      <text class="pixel-h2">📜 流水明细</text>
      <view v-for="tx in walletStore.transactions" :key="tx.id" class="tx-row">
        <view class="tx-info">
          <text class="tx-remark">{{ tx.remark || typeLabel(tx.type) }}</text>
          <text class="tx-time">{{ formatTime(tx.createTime) }}</text>
        </view>
        <view class="tx-right">
          <text class="tx-amount" :class="{ income: tx.amount > 0 }">{{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}</text>
          <text class="tx-balance">余额 {{ tx.balanceAfter }}</text>
        </view>
      </view>
      <view v-if="!walletStore.loading && walletStore.transactions.length === 0" class="tx-empty">
        还没有流水，去打个卡赚喵币！
      </view>
      <view v-if="walletStore.hasMore" class="tx-more" @tap="loadMore">
        {{ walletStore.loading ? '加载中…' : '加载更多' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { useWalletStore } from '@/stores/wallet'

const walletStore = useWalletStore()

onShow(() => {
  if (!ensureLogin()) return
  walletStore.fetchWallet(true)
})

function loadMore() {
  walletStore.fetchWallet(false)
}

const typeLabel = (type: number) =>
  ({ 1: '打卡奖励', 2: '押金', 3: '退款', 4: '奖池分成', 5: '补卡扣除', 0: '注册赠送' } as Record<number, string>)[type] ?? '喵币变动'

const formatTime = (iso: string) => {
  if (!iso) return ''
  return iso.replace('T', ' ').slice(5, 16)
}
</script>

<style lang="scss" scoped>
.wallet {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.balance-card {
  background: $pixel-yellow;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 24rpx;

  .balance-label {
    font-size: 24rpx;
    font-weight: 700;
    color: rgba(74, 55, 40, 0.7);
  }

  .balance-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 16rpx;
  }

  .balance-coin {
    width: 72rpx;
    height: 72rpx;
  }

  .balance-num {
    font-size: 72rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .balance-tip {
    margin-top: 12rpx;
    font-size: 20rpx;
    color: rgba(74, 55, 40, 0.6);
  }
}

.tx-card {
  .tx-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include pixel-block;
    padding: 16rpx 20rpx;
    margin-top: 14rpx;
  }

  .tx-remark {
    display: block;
    font-size: 26rpx;
    font-weight: 800;
    color: $pixel-ink;
  }

  .tx-time {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: $pixel-ink-light;
  }

  .tx-right {
    text-align: right;
  }

  .tx-amount {
    display: block;
    font-size: 28rpx;
    font-weight: 900;
    color: $pixel-red;

    &.income {
      color: $pixel-green-dark;
    }
  }

  .tx-balance {
    display: block;
    margin-top: 4rpx;
    font-size: 18rpx;
    color: $pixel-ink-light;
  }

  .tx-empty {
    margin-top: 20rpx;
    text-align: center;
    font-size: 24rpx;
    color: $pixel-ink-light;
  }

  .tx-more {
    margin-top: 20rpx;
    text-align: center;
    font-size: 24rpx;
    font-weight: 700;
    color: $pixel-primary-dark;
  }
}
</style>
