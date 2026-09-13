<template>
  <view class="den">
    <!-- 总览 -->
    <view class="overview pixel-card">
      <text class="pixel-h2">🏠 猫窝总览</text>
      <view class="ov-stats">
        <view class="ov-stat">
          <text class="ov-num">{{ planStore.cats.length }}</text>
          <text class="ov-label">猫口</text>
        </view>
        <view class="ov-stat">
          <text class="ov-num">{{ planStore.totalCatLevel }}</text>
          <text class="ov-label">总等级</text>
        </view>
        <view class="ov-stat">
          <text class="ov-num">{{ planStore.totalBossDefeated }}</text>
          <text class="ov-label">击败 BOSS</text>
        </view>
      </view>
    </view>

    <!-- 猫咪墙 -->
    <view class="cat-grid">
      <view
        v-for="entry in planStore.cats"
        :key="entry.cat.id"
        class="cat-cell pixel-card"
        @tap="goPlan(entry.plan.id)"
      >
        <view class="cat-sprite-wrap">
          <pixel-cat :cat-type="entry.cat.catType" :pose="entry.plan.todayChecked ? 'happy' : 'idle'" :size="140" />
          <view v-if="!entry.plan.todayChecked && entry.plan.status === 0" class="hungry-dot" />
        </view>
        <text class="cat-cell-name">{{ entry.cat.catName }}</text>
        <text class="cat-cell-plan">{{ entry.plan.planName }}</text>
        <view class="cat-cell-meta">
          <text class="lv">Lv.{{ entry.cat.level }}</text>
          <text class="exp">EXP {{ entry.cat.experience }}/{{ entry.cat.expToNextLevel }}</text>
        </view>
        <view class="pixel-progress cell-exp">
          <view class="bar-fill cell-exp-fill" :style="{ width: expPercentOf(entry.cat) + '%' }" />
        </view>
        <text class="cat-cell-boss">⚔️ {{ entry.cat.bossName }}</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!planStore.loading && planStore.cats.length === 0" class="empty pixel-card">
        <pixel-cat :cat-type="4" pose="idle" :size="160" />
        <text class="empty-title">猫窝空空如也</text>
        <text class="empty-sub">创建打卡计划，即可领养猫精灵</text>
        <button class="pixel-btn-green" @tap="goCreate">去建计划</button>
      </view>
    </view>

    <!-- 底部提示 -->
    <text class="den-tip">每只猫对应一个打卡计划 · 打卡喂猫，猫帮你打 BOSS</text>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import PixelCat from '@/components/pixel-cat/pixel-cat.vue'
import { usePlanStore } from '@/stores/plan'
import type { CatVO } from '@/types/api'

const planStore = usePlanStore()

onShow(() => {
  planStore.fetchPlans(true)
})

const expPercentOf = (cat: CatVO) => {
  if (!cat.expToNextLevel) return 0
  return Math.min(100, Math.round((cat.experience / cat.expToNextLevel) * 100))
}

function goPlan(planId: number) {
  uni.navigateTo({ url: `/pages/plan/detail?id=${planId}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/plan/create' })
}
</script>

<style lang="scss" scoped>
.den {
  padding: 24rpx 24rpx 60rpx;
}

.overview {
  margin-bottom: 24rpx;
  background: $pixel-green;

  .ov-stats {
    display: flex;
    justify-content: space-around;
    margin-top: 20rpx;
  }

  .ov-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    @include pixel-block;
    background: rgba(255, 251, 239, 0.85);
    padding: 12rpx 32rpx;
  }

  .ov-num {
    font-size: 36rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .ov-label {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.cat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;

  .cat-sprite-wrap {
    position: relative;
  }

  .hungry-dot {
    position: absolute;
    top: 0;
    right: 0;
    width: 16rpx;
    height: 16rpx;
    background: $pixel-red;
    border: 3rpx solid $pixel-ink;
    animation: blink 1.2s steps(2) infinite;
  }

  .cat-cell-name {
    margin-top: 8rpx;
    font-size: 28rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .cat-cell-plan {
    margin-top: 4rpx;
    font-size: 20rpx;
    color: $pixel-ink-light;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cat-cell-meta {
    display: flex;
    gap: 12rpx;
    margin-top: 10rpx;
    font-size: 20rpx;
    font-weight: 700;

    .lv {
      color: $pixel-primary-dark;
    }

    .exp {
      color: $pixel-ink-light;
    }
  }

  .cell-exp {
    width: 100%;
    margin-top: 8rpx;

    .cell-exp-fill {
      display: block;
      background: $pixel-blue;
    }
  }

  .cat-cell-boss {
    margin-top: 10rpx;
    font-size: 20rpx;
    color: $pixel-purple;
    font-weight: 700;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.empty {
  grid-column: span 2;
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
  }
}

.den-tip {
  display: block;
  margin-top: 32rpx;
  text-align: center;
  font-size: 22rpx;
  color: $pixel-ink-light;
}

@keyframes blink {
  50% {
    opacity: 0.2;
  }
}
</style>
