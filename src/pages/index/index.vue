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
        class="plan-group"
      >
        <view class="plan-card pixel-card" :class="{ paused: plan.status !== 0 }" @tap="goDetail(plan.id)">
          <view class="plan-top">
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
              <view class="meta-chip">
                <text>Lv.{{ plan.cat?.level ?? 1 }}</text>
              </view>
            </view>
          </view>
          <view v-if="plan.todayChecked" class="plan-done">✓</view>
          </view>
        </view>
        <!-- 每日任务：主框下方缩进展示，直接勾选，勾满自动打卡 -->
        <view v-if="plan.dailyTasks && plan.dailyTasks.length && plan.status === 0" class="card-tasks">
          <view
            v-for="(task, ti) in plan.dailyTasks"
            :key="ti"
            class="card-task"
            :class="{ done: isTaskDone(plan, ti), frozen: plan.todayChecked }"
            @tap="onToggleTask(plan, ti)"
          >
            <view class="task-check">{{ isTaskDone(plan, ti) ? '✓' : '' }}</view>
            <text class="task-text">{{ task }}</text>
          </view>
        </view>
        <!-- 无任务的计划：跳详情页打卡 -->
        <view
          v-else-if="plan.status === 0 && !plan.todayChecked"
          class="go-detail"
          @tap="goDetail(plan.id)"
        >
          去打卡 ›
        </view>
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
import { computed, reactive, ref } from 'vue'
import { toggleTask } from '@/api/plan'
import BattleResult from '@/components/battle-result/battle-result.vue'
import PixelCat from '@/components/pixel-cat/pixel-cat.vue'
import { planTypeIcon, pixelCat } from '@/constants/pixel'
import { usePlanStore } from '@/stores/plan'
import { useUserStore } from '@/stores/user'
import { loadTaskProgress, saveTaskProgress } from '@/utils/taskState'
import type { CheckInResultVO, PlanVO } from '@/types/api'

const planStore = usePlanStore()
const userStore = useUserStore()

const showBattle = ref(false)
const battleResult = ref<CheckInResultVO | null>(null)
const battlePlanId = ref<number | null>(null)
/** 每计划的今日任务位图本地状态（与详情页共享按天缓存） */
const taskProgress = reactive<Record<number, string>>({})

const isTaskDone = (plan: PlanVO, index: number) =>
  (taskProgress[plan.id] ?? '')[index] === '1'

function syncTaskProgress() {
  for (const p of planStore.plans) {
    if (p.dailyTasks?.length && taskProgress[p.id] === undefined) {
      taskProgress[p.id] = loadTaskProgress(p.id)
    }
  }
}

async function onToggleTask(plan: PlanVO, index: number) {
  if (plan.todayChecked || plan.status !== 0) return
  const total = plan.dailyTasks?.length ?? 0
  const cur = (taskProgress[plan.id] ?? '').padEnd(total, '0')
  const next = cur[index] !== '1'   // 未勾→勾选(true)，已勾→取消(false)
  const nextChar = next ? '1' : '0'
  const newProgress = cur.slice(0, index) + nextChar + cur.slice(index + 1)
  taskProgress[plan.id] = newProgress
  saveTaskProgress(plan.id, newProgress)
  try {
    const vo = await toggleTask(plan.id, index, next)
    if (vo.taskProgress) {
      taskProgress[plan.id] = vo.taskProgress
      saveTaskProgress(plan.id, vo.taskProgress)
    }
    if (vo.autoChecked && vo.checkInResult) {
      battlePlanId.value = plan.id
      battleResult.value = vo.checkInResult
      showBattle.value = true
      planStore.fetchPlans(true)
      userStore.fetchMe()
    }
  } catch {
    taskProgress[plan.id] = cur // 失败回滚
  }
}

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
  planStore.fetchPlans(true).then(syncTaskProgress)
  userStore.fetchMe()
})

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

  .plan-done {
    @include pixel-btn($pixel-green);
    width: 72rpx;
    height: 56rpx;
    font-size: 28rpx;
    flex-shrink: 0;
    padding: 0;
  }
}

.plan-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.plan-top {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.card-tasks {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-left: 44rpx;
}

.card-task {
  display: flex;
  align-items: center;
  gap: 14rpx;
  @include pixel-block;
  background: $pixel-card-alt;
  padding: 12rpx 16rpx;

  .task-check {
    width: 36rpx;
    height: 36rpx;
    background: #fff;
    border: 2rpx solid $pixel-ink;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    font-weight: 900;
    color: $pixel-green-dark;
    flex-shrink: 0;
  }

  .task-text {
    font-size: 24rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  &.done {
    background: $pixel-green;

    .task-text {
      color: #fff;
      text-decoration: line-through;
    }

    .task-check {
      color: $pixel-green;
    }
  }

  &.frozen {
    opacity: 0.7;
  }
}

.go-detail {
  margin-left: 44rpx;
  font-size: 24rpx;
  font-weight: 800;
  color: $pixel-primary-dark;
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
