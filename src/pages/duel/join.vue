<template>
  <view class="join-page">
    <!-- 邀请信息 -->
    <view v-if="info" class="info-card pixel-card">
      <view class="info-head">
        <text class="info-title">⚔️ 邀请你加入死斗</text>
        <text class="info-sub">{{ info.leaderInvite ? '组长诚邀' : `${info.inviterName} 邀请你` }}</text>
      </view>

      <view class="duel-name">{{ info.duelName }}</view>

      <view class="info-stats">
        <view class="stat"><text class="num">💰{{ info.depositPerMember }}</text><text class="lab">每人押金</text></view>
        <view class="stat"><text class="num">{{ info.totalDays }}</text><text class="lab">死斗天数</text></view>
        <view class="stat"><text class="num">{{ info.memberCount }}</text><text class="lab">当前人数</text></view>
      </view>

      <view class="meta-rows">
        <view class="meta-row"><text class="k">组长</text><text class="v">{{ info.leaderName }}</text></view>
        <view class="meta-row"><text class="k">邀请人</text><text class="v">{{ info.inviterName }}</text></view>
        <view class="meta-row"><text class="k">加入方式</text><text class="v">{{ modeLabel }}</text></view>
        <view class="meta-row"><text class="k">当前状态</text><text class="v">{{ duelStatusLabel(info.status) }}</text></view>
      </view>

      <!-- 动作区 -->
      <view v-if="info.status !== 0" class="action disabled-btn">该死斗已不在招募期</view>
      <view v-else-if="!userStore.isLoggedIn" class="action pixel-btn" @tap="goLogin">去登录后加入</view>
      <view v-else-if="joining" class="action disabled-btn">处理中…</view>
      <view v-else-if="joined" class="action pixel-btn-green" @tap="goDuelDetail">✓ 已加入，查看死斗</view>
      <view v-else-if="applied" class="action disabled-btn">✓ 申请已提交，等待组长审批</view>
      <view v-else-if="info.joinAction === 'direct'" class="action pixel-btn-green" @tap="doUse">
        💰 押 {{ info.depositPerMember }} 喵币，直接加入
      </view>
      <view v-else class="action pixel-btn" @tap="doApply">📝 申请加入（组长审批）</view>
    </view>

    <!-- 加载中 / 失效 -->
    <view v-if="loading" class="state-card pixel-card">邀请信息加载中…</view>
    <view v-if="loadFailed" class="state-card pixel-card">
      <text class="fail-emoji">💀</text>
      <text class="fail-text">邀请已失效或不存在</text>
      <text class="fail-sub">向分享者要一个新邀请吧</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { applyJoinDuel, getInviteInfo, useInviteCode } from '@/api/duel'
import { duelStatusLabel } from '@/constants/pixel'
import { useUserStore } from '@/stores/user'
import type { InviteInfoVO } from '@/types/api'
import { storage } from '@/utils/storage'

const userStore = useUserStore()

const code = ref('')
const info = ref<InviteInfoVO | null>(null)
const loading = ref(true)
const loadFailed = ref(false)
const joining = ref(false)
const joined = ref(false)
const applied = ref(false)

const modeLabel = ref('')

onLoad(async (options) => {
  code.value = String(options?.code || '')
  if (!code.value) {
    loading.value = false
    loadFailed.value = true
    return
  }
  try {
    info.value = await getInviteInfo(code.value)
    modeLabel.value = info.value.joinMode === 1 ? '需组长审批' : '自由加入'
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
})

function goLogin() {
  storage.set('pendingInviteCode', code.value)
  uni.reLaunch({ url: '/pages/login/login' })
}

async function doUse() {
  if (joining.value) return
  joining.value = true
  try {
    const result = await useInviteCode(code.value)
    if (result.action === 'apply') {
      applied.value = true
      uni.showToast({ title: '申请已提交', icon: 'none' })
    } else {
      joined.value = true
      uni.showToast({ title: '加入成功！', icon: 'success' })
    }
  } catch {
    // 余额不足/已满员等，统一提示
  } finally {
    joining.value = false
  }
}

async function doApply() {
  if (joining.value || !info.value) return
  joining.value = true
  try {
    await applyJoinDuel(info.value.duelId)
    applied.value = true
    uni.showToast({ title: '申请已提交，等待组长审批', icon: 'none' })
  } catch {
    // 统一提示
  } finally {
    joining.value = false
  }
}

function goDuelDetail() {
  if (!info.value) return
  uni.redirectTo({ url: `/pages/duel/detail?id=${info.value.duelId}` })
}
</script>
<style lang="scss" scoped>
.join-page {
  padding: 24rpx;
}

.info-card {
  background: $pixel-green;

  .info-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 24rpx;
  }

  .info-title {
    font-size: 38rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .info-sub {
    font-size: 24rpx;
    font-weight: 700;
    color: rgba(74, 55, 40, 0.7);
  }

  .duel-name {
    @include pixel-card(#fffbeF);
    text-align: center;
    font-size: 34rpx;
    font-weight: 900;
    color: $pixel-ink;
    padding: 20rpx;
  }

  .info-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
  }

  .stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    @include pixel-block;
    background: rgba(255, 251, 239, 0.9);
    padding: 12rpx 0;

    .num {
      font-size: 30rpx;
      font-weight: 900;
      color: $pixel-ink;
    }

    .lab {
      font-size: 18rpx;
      color: $pixel-ink-light;
    }
  }

  .meta-rows {
    margin-top: 20rpx;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    padding: 12rpx 4rpx;
    border-bottom: 2rpx dashed rgba(74, 55, 40, 0.2);

    .k {
      font-size: 24rpx;
      color: $pixel-ink-light;
    }

    .v {
      font-size: 24rpx;
      font-weight: 800;
      color: $pixel-ink;
    }
  }
}

.action {
  margin-top: 28rpx;

  &.pixel-btn,
  &.pixel-btn-green {
    width: 100%;
    font-size: 30rpx;
  }

  &.disabled-btn {
    @include pixel-btn($pixel-card-alt, $pixel-ink-light);
    width: 100%;
    text-align: center;
    font-size: 26rpx;
    font-weight: 700;
  }
}

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 60rpx 40rpx;

  .fail-emoji {
    font-size: 64rpx;
  }

  .fail-text {
    font-size: 30rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .fail-sub {
    font-size: 22rpx;
    color: $pixel-ink-light;
  }
}
</style>
