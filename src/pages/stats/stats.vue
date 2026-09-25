<template>
  <view class="page">
    <!-- 周报 -->
    <view class="pixel-card section">
      <view class="flex-between">
        <text class="pixel-h2">📅 本周周报</text>
        <button class="pixel-btn-sm" :loading="loadingWeekly" @tap="loadWeekly">刷新</button>
      </view>
      <template v-if="weekly">
        <text class="week-range">{{ weekly.weekStart }} ~ {{ weekly.weekEnd }}</text>
        <!-- 本周每日打卡柱 -->
        <view class="week-bars">
          <view v-for="d in weekly.perDay" :key="d.date" class="day-col">
            <view class="bar-wrap">
              <view class="bar" :style="{ height: barHeight(d.count) + 'rpx' }" />
            </view>
            <text class="day-num">{{ d.count }}</text>
            <text class="day-label">{{ d.date.slice(8) }}</text>
          </view>
        </view>
        <view class="week-stats">
          <text class="stat-chip">本周 {{ weekly.totalCheckins }} 次</text>
          <text class="stat-chip">上周 {{ weekly.lastWeekTotal }} 次</text>
          <text class="stat-chip">全勤连击 {{ weekly.currentFullStreak }} 天</text>
          <text class="stat-chip">最强计划连击 {{ weekly.bestPlanStreak }} 天</text>
        </view>
        <view class="plan-progress">
          <text class="sub-title">各计划本周完成天数</text>
          <view v-for="p in weekly.perPlan" :key="p.planId" class="plan-line">
            <text class="plan-line-name">{{ p.planName }}</text>
            <text class="plan-line-days">{{ p.days }} 天</text>
          </view>
          <text v-if="weekly.perPlan.length === 0" class="empty-line">暂无进行中的计划</text>
        </view>
        <view class="ai-box">
          <text class="sub-title">🤖 AI 周报</text>
          <text class="ai-text">{{ weekly.aiSummary }}</text>
        </view>
      </template>
    </view>

    <!-- 年度热力图 -->
    <view class="pixel-card section">
      <view class="flex-between">
        <text class="pixel-h2">🔥 {{ heatYear }} 年热力图</text>
        <view class="year-nav">
          <button class="pixel-btn-sm" @tap="shiftYear(-1)">‹</button>
          <button class="pixel-btn-sm" @tap="shiftYear(1)">›</button>
        </view>
      </view>
      <view class="heatmap">
        <view v-for="m in heatMonths" :key="m.month" class="heat-month">
          <text class="heat-month-label">{{ m.month }}月</text>
          <view class="heat-grid">
            <view
              v-for="d in m.days"
              :key="d.date"
              class="heat-cell"
              :class="'lv' + levelOf(d.count)"
              :title="d.date + ' ' + d.count + ' 次'"
            />
          </view>
        </view>
      </view>
      <view class="legend">
        <text>少</text>
        <view class="heat-cell lv0" /><view class="heat-cell lv1" /><view class="heat-cell lv2" /><view class="heat-cell lv3" />
        <text>多</text>
      </view>
    </view>

    <!-- 徽章墙 -->
    <view class="pixel-card section">
      <view class="flex-between">
        <text class="pixel-h2">🏅 徽章墙</text>
        <button class="pixel-btn-sm" :loading="loadingBadges" @tap="loadBadges">刷新</button>
      </view>
      <view class="badge-grid">
        <view v-for="b in badges" :key="b.code" class="badge-cell" :class="{ locked: !b.unlocked }">
          <text class="badge-icon">{{ b.unlocked ? '🏅' : '🔒' }}</text>
          <text class="badge-name">{{ b.name }}</text>
          <text class="badge-desc">{{ b.unlocked ? '已解锁' : b.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { getAchievementWall, getHeatmap, getWeeklyStats } from '@/api/stats'
import type { AchievementVO, HeatmapDayVO, WeeklyStatsVO } from '@/types/api'

const weekly = ref<WeeklyStatsVO | null>(null)
const loadingWeekly = ref(false)

const heatYear = ref(new Date().getFullYear())
const heatDays = ref<HeatmapDayVO[]>([])
const loadingHeat = ref(false)

const badges = ref<AchievementVO[]>([])
const loadingBadges = ref(false)

onShow(() => {
  if (!ensureLogin()) return
  loadWeekly()
  loadHeat()
  loadBadges()
})

function loadWeekly() {
  loadingWeekly.value = true
  getWeeklyStats()
    .then((d) => (weekly.value = d))
    .catch(() => {})
    .finally(() => (loadingWeekly.value = false))
}

function loadHeat() {
  loadingHeat.value = true
  getHeatmap(heatYear.value)
    .then((d) => (heatDays.value = d || []))
    .catch(() => {})
    .finally(() => (loadingHeat.value = false))
}

function shiftYear(delta: number) {
  heatYear.value += delta
  loadHeat()
}

function loadBadges() {
  loadingBadges.value = true
  getAchievementWall()
    .then((d) => (badges.value = d || []))
    .catch(() => {})
    .finally(() => (loadingBadges.value = false))
}

const heatMonths = computed(() => {
  // 当年 12 个月 × 每日格子，色阶按打卡次数
  const months: { month: number; days: HeatmapDayVO[] }[] = []
  const byDate = new Map(heatDays.value.map((d) => [d.date, d.count]))
  for (let m = 1; m <= 12; m++) {
    const last = new Date(heatYear.value, m, 0).getDate()
    const days: HeatmapDayVO[] = []
    for (let d = 1; d <= last; d++) {
      const date = `${heatYear.value}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ date, count: byDate.get(date) ?? 0 })
    }
    months.push({ month: m, days })
  }
  return months
})

function levelOf(count: number) {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  return 3
}

function barHeight(count: number) {
  return Math.min(120, 12 + count * 24)
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.week-range {
  font-size: 24rpx;
  color: $pixel-ink-light;
}

.week-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 8rpx;
}

.day-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;

  .bar-wrap {
    height: 130rpx;
    display: flex;
    align-items: flex-end;
  }

  .bar {
    width: 40rpx;
    background: $pixel-primary;
    border: 3rpx solid $pixel-ink;
  }

  .day-num {
    font-size: 22rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  .day-label {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}

.week-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;

  .stat-chip {
    background: $pixel-card-alt;
    border: 2rpx solid $pixel-ink;
    padding: 6rpx 16rpx;
    font-size: 22rpx;
    color: $pixel-ink;
  }
}

.sub-title {
  font-size: 24rpx;
  font-weight: 700;
  color: $pixel-ink;
}

.plan-progress {
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .plan-line {
    display: flex;
    justify-content: space-between;

    .plan-line-name {
      font-size: 24rpx;
      color: $pixel-ink;
    }

    .plan-line-days {
      font-size: 24rpx;
      color: $pixel-ink-light;
    }
  }

  .empty-line {
    font-size: 22rpx;
    color: $pixel-ink-light;
  }
}

.ai-box {
  background: $pixel-card-alt;
  border: 2rpx dashed $pixel-ink-light;
  padding: 16rpx;

  .ai-text {
    font-size: 24rpx;
    color: $pixel-ink;
    line-height: 1.6;
  }
}

.heatmap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.heat-month {
  width: calc(25% - 12rpx);

  .heat-month-label {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }

  .heat-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4rpx;
  }
}

.heat-cell {
  width: 100%;
  padding-top: 100%;
  background: $pixel-card-alt;
  border: 1rpx solid $pixel-ink-light;

  &.lv1 {
    background: #f7c948;
  }

  &.lv2 {
    background: $pixel-primary;
  }

  &.lv3 {
    background: $pixel-red;
  }
}

.legend {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }

  .heat-cell {
    width: 20rpx;
    padding-top: 0;
    height: 20rpx;
  }
}

.badge-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.badge-cell {
  width: calc(25% - 12rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 12rpx 0;
  border: 2rpx solid $pixel-ink;
  background: $pixel-card-alt;

  .badge-icon {
    font-size: 34rpx;
  }

  .badge-name {
    font-size: 22rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  .badge-desc {
    font-size: 18rpx;
    color: $pixel-ink-light;
    text-align: center;
    padding: 0 8rpx;
  }

  &.locked {
    opacity: 0.55;
  }
}
</style>
