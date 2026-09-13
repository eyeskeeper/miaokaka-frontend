<template>
  <view class="home">
    <!-- 顶部状态条 -->
    <view class="top-bar pixel-card">
      <view class="top-left">
        <text class="top-date">{{ todayLabel }}</text>
        <view class="top-streak">
          <image class="pixelated" src="/static/pixel/icon-flame.png" />
          <text>全勤连击 {{ userStore.currentStreak }} 天</text>
        </view>
      </view>
      <view class="top-right">
        <view class="coin-chip" @tap="goWallet">
          <image class="pixelated" src="/static/pixel/icon-coin.png" />
          <text>{{ userStore.totalPoints }}</text>
        </view>
        <view class="rank-chip" @tap="goRanking">
          <image class="pixelated" src="/static/pixel/icon-trophy.png" />
        </view>
      </view>
    </view>

    <!-- 今日概览 -->
    <view class="summary pixel-card">
      <image class="pixelated summary-cat" :src="summaryCatSrc" mode="aspectFit" />
      <view class="summary-text">
        <text class="summary-title">{{ summaryTitle }}</text>
        <text class="summary-sub">{{ summarySub }}</text>
      </view>
    </view>

    <!-- 计划列表 -->
    <view class="plan-list">
      <view
        v-for="plan in planStore.plans"
        :key="plan.id"
        class="plan-card pixel-card"
        :class="{ paused: plan.status !== 0 }"
        @tap="goDetail(plan.id)"
      >
        <PixelCat v-if="plan.cat" :cat-type="plan.cat.catType" :size="120" />
        <view class="plan-info">
          <view class="flex-between">
            <text class="plan-name">{{ planTypeIcon(plan.planType) }} {{ plan.planName }}</text>
            <text v-if="plan.status !== 0" class="pixel-tag">已暂停</text>
          </view>
          <view class="plan-meta">
            <view class="meta-chip">
              <image class="pixelated" src="/static/pixel/icon-flame.png" />
              <text>{{ plan.currentStreak }}天</text>
            </view>
            <view v-if="plan.dailyTasks && plan.dailyTasks.length" class="meta-chip">
              <text>☑ {{ plan.dailyTasks.length }} 项任务</text>
            </view>
            <view class="meta-chip">
              <text>Lv.{{ plan.cat?.level ?? 1 }}</text>
            </view>
          </view>
        </view>
        <button
          v-if="plan.status === 0 && !plan.todayChecked"
          class="pixel-btn-sm plan-check"
          :loading="checkingId === plan.id"
          @tap.stop="doCheckIn(plan)"
        >
          打卡
        </button>
        <view v-else-if="plan.todayChecked" class="plan-done">✓</view>
      </view>

      <!-- 空状态 -->
      <view v-if="!planStore.loading && planStore.plans.length === 0" class="empty pixel-card">
        <PixelCat :cat-type="0" pose="happy" :size="180" />
        <text class="empty-title">还没有打卡计划</text>
        <text class="empty-sub">建一个计划，马上领养一只猫精灵！</text>
        <button class="pixel-btn-green" @tap="goCreate">去建计划</button>
      </view>
    </view>

    <!-- 新建按钮 -->
    <view class="fab" @tap="goCreate">＋</view>

    <!-- 全屏战斗结算 -->
    <battle-result
      :visible="showBattle"
      :result="battleResult"
      :boss-level="battleBossLevel"
      @close="onBattleClose"
    />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { checkIn } from '@/api/checkin'
import BattleResult from '@/components/battle-result/battle-result.vue'
import PixelCat from '@/components/pixel-cat/pixel-cat.vue'
import { planTypeIcon, pixelCat } from '@/constants/pixel'
import { usePlanStore } from '@/stores/plan'
import { useUserStore } from '@/stores/user'
import type { CheckInResultVO, PlanVO } from '@/types/api'

const planStore = usePlanStore()
const userStore = useUserStore()

const checkingId = ref<number | null>(null)
const showBattle = ref(false)
const battleResult = ref<CheckInResultVO | null>(null)
const battlePlanId = ref<number | null>(null)

const battleBossLevel = computed(
  () => planStore.plans.find((p) => p.id === battlePlanId.value)?.cat?.bossLevel ?? 1
)

const now = new Date()
const weekDay = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()]
const todayLabel = `${now.getMonth() + 1}月${now.getDate()}日 周${weekDay}`

const summaryCatSrc = computed(() => {
  const cats = planStore.cats
  if (planStore.todayRemaining === 0 && cats.length) {
    return pixelCat(cats[0].cat.catType, 'happy')
  }
  return pixelCat(cats[0]?.cat.catType ?? 0)
})

const summaryTitle = computed(() => {
  if (planStore.plans.length === 0) return '欢迎来到喵卡卡！'
  if (planStore.todayRemaining === 0) return '今日全部打卡完成！'
  return `还有 ${planStore.todayRemaining} 个计划待打卡`
})

const summarySub = computed(() => {
  if (planStore.plans.length === 0) return '每建一个计划，就有一只猫精灵加入你的猫窝'
  if (planStore.todayRemaining === 0) return '猫猫们今晚可以安心睡觉啦～'
  return '打败 BOSS，喂大你的猫！'
})

onShow(() => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  planStore.fetchPlans(true)
  userStore.fetchMe()
})

async function doCheckIn(plan: PlanVO) {
  if (checkingId.value) return
  checkingId.value = plan.id
  battlePlanId.value = plan.id
  try {
    battleResult.value = await checkIn({ planId: plan.id })
    showBattle.value = true
    // 结算后本地更新：直接打卡即完成，任务类计划可能有剩余勾选，交由详情页处理
    planStore.fetchPlans(true)
    userStore.fetchMe()
  } catch {
    // 错误已统一提示
  } finally {
    checkingId.value = null
  }
}

function onBattleClose() {
  showBattle.value = false
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/plan/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/plan/create' })
}

function goWallet() {
  uni.navigateTo({ url: '/pages/wallet/wallet' })
}

function goRanking() {
  uni.navigateTo({ url: '/pages/ranking/ranking' })
}
</script>

<style lang="scss" scoped>
.home {
  padding: 24rpx 24rpx 160rpx;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;

  .top-date {
    @include pixel-title;
    font-size: 30rpx;
  }

  .top-streak {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 8rpx;
    font-size: 22rpx;
    font-weight: 700;
    color: $pixel-green-dark;

    image {
      width: 28rpx;
      height: 28rpx;
    }
  }

  .top-right {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .coin-chip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    @include pixel-block;
    padding: 8rpx 16rpx;
    font-size: 26rpx;
    font-weight: 800;
    color: $pixel-primary-dark;

    image {
      width: 30rpx;
      height: 30rpx;
    }
  }

  .rank-chip {
    @include pixel-block;
    padding: 8rpx 12rpx;

    image {
      width: 30rpx;
      height: 30rpx;
      display: block;
    }
  }
}

.summary {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
  background: $pixel-yellow;

  .summary-cat {
    width: 120rpx;
    height: 120rpx;
  }

  .summary-title {
    display: block;
    @include pixel-title;
    font-size: 32rpx;
  }

  .summary-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: rgba(74, 55, 40, 0.7);
  }
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.plan-card {
  display: flex;
  align-items: center;
  gap: 20rpx;

  &.paused {
    opacity: 0.65;
  }

  .plan-info {
    flex: 1;
    min-width: 0;
  }

  .plan-name {
    @include pixel-title;
    font-size: 30rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .plan-meta {
    display: flex;
    gap: 12rpx;
    margin-top: 12rpx;
    flex-wrap: wrap;
  }

  .meta-chip {
    display: flex;
    align-items: center;
    gap: 6rpx;
    @include pixel-block;
    padding: 4rpx 12rpx;
    font-size: 20rpx;
    font-weight: 700;
    color: $pixel-ink;

    image {
      width: 24rpx;
      height: 24rpx;
    }
  }

  .plan-check {
    flex-shrink: 0;
  }

  .plan-done {
    @include pixel-btn($pixel-green);
    width: 72rpx;
    height: 56rpx;
    font-size: 28rpx;
    flex-shrink: 0;
    padding: 0;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 60rpx 40rpx;

  .empty-title {
    @include pixel-title;
    font-size: 32rpx;
  }

  .empty-sub {
    font-size: 24rpx;
    color: $pixel-ink-light;
    text-align: center;
  }
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 80rpx;
  width: 112rpx;
  height: 112rpx;
  @include pixel-btn($pixel-primary);
  border-radius: 0;
  font-size: 56rpx;
  font-weight: 900;
  z-index: 10;
}
</style>
