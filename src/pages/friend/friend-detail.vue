<template>
  <view class="page">
    <view class="pixel-card section">
      <text class="pixel-h2">🐱 {{ data?.friendName }} 的猫窝</text>
      <text class="tip">围观好友进行中计划的猫（仅好友可见）</text>
      <view v-for="c in data?.cats ?? []" :key="c.planId" class="cat-row">
        <view class="cat-avatar">{{ (c.catName || '?').slice(0, 1) }}</view>
        <view class="cat-info" @tap="openCalendar(c)">
          <text class="cat-name">Lv.{{ c.level }} {{ c.catName }}</text>
          <text class="cat-sub">{{ c.planName }} · 已击败 BOSS {{ c.totalBossDefeated }} 只</text>
        </view>
        <button class="pixel-btn-sm" @tap="openCalendar(c)">看日历</button>
      </view>
      <text v-if="data && (data.cats ?? []).length === 0" class="empty-line">好友还没有进行中的计划</text>
    </view>

    <!-- 只读日历 -->
    <view v-if="calendarPlan" class="pixel-card section">
      <view class="flex-between">
        <text class="pixel-h2">📅 {{ calendarPlan.planName }} 的打卡日历</text>
        <button class="pixel-btn-sm" @tap="calendarPlan = null">收起</button>
      </view>
      <view class="cal-nav">
        <button class="pixel-btn-sm" @tap="shiftMonth(-1)">‹ 上月</button>
        <text class="cal-month">{{ month }}</text>
        <button class="pixel-btn-sm" @tap="shiftMonth(1)">下月 ›</button>
      </view>
      <view class="cal-grid">
        <view v-for="d in calendarDays" :key="d.date" class="cal-cell" :class="'s' + d.status">
          {{ d.date.slice(8) }}
        </view>
        <text v-if="calendarDays.length === 0" class="empty-line">该月暂无打卡</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { getFriendCalendar, getFriendCats } from '@/api/friend'
import type { DayRecord, FriendCatVO } from '@/types/api'

const data = ref<FriendCatVO | null>(null)
const friendId = ref(0)
const calendarPlan = ref<{ planId: number; planName: string } | null>(null)
const month = ref('')
const calendarDays = ref<DayRecord[]>([])

onLoad((options) => {
  if (!ensureLogin()) return
  friendId.value = Number(options?.friendId ?? 0)
  const now = new Date()
  month.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  getFriendCats(friendId.value)
    .then((d) => (data.value = d))
    .catch(() => {})
})

function openCalendar(c: { planId: number; planName: string }) {
  calendarPlan.value = { planId: c.planId, planName: c.planName }
  loadCalendar()
}

function shiftMonth(delta: number) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  loadCalendar()
}

function loadCalendar() {
  if (!calendarPlan.value) return
  getFriendCalendar(friendId.value, calendarPlan.value.planId, month.value)
    .then((d) => (calendarDays.value = d?.days ?? []))
    .catch(() => {})
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

.tip {
  font-size: 22rpx;
  color: $pixel-ink-light;
}

.cat-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx dashed $pixel-ink-light;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.cat-avatar {
  width: 64rpx;
  height: 64rpx;
  border: 3rpx solid $pixel-ink;
  background: $pixel-card-alt;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: $pixel-ink;
  flex-shrink: 0;
}

.cat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;

  .cat-name {
    font-size: 26rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  .cat-sub {
    font-size: 22rpx;
    color: $pixel-ink-light;
  }
}

.cal-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .cal-month {
    font-size: 26rpx;
    font-weight: 700;
    color: $pixel-ink;
  }
}

.cal-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;

  .cal-cell {
    width: calc(100% / 7 - 8rpx);
    text-align: center;
    padding: 8rpx 0;
    font-size: 22rpx;
    color: $pixel-ink-light;
    border: 2rpx solid $pixel-ink-light;

    &.s0 {
      background: $pixel-green;
      color: #fffbef;
      border-color: $pixel-ink;
    }

    &.s1 {
      background: $pixel-yellow;
      color: $pixel-ink;
      border-color: $pixel-ink;
    }
  }
}

.empty-line {
  font-size: 24rpx;
  color: $pixel-ink-light;
  padding: 8rpx 0;
}
</style>
