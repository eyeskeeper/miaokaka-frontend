<template>
  <view class="checkin-container">
    <view v-if="currentPlan" class="checkin-content">
      <!-- 计划详情卡片 -->
      <view class="plan-card">
        <view class="plan-header">
          <u-tag :text="currentPlan.points + '积分'" type="success" size="mini"></u-tag>
          <text class="plan-title">{{ currentPlan.title }}</text>
        </view>
        <text class="plan-description">{{ currentPlan.description }}</text>

        <!-- 打卡状态 -->
        <view class="checkin-status">
          <u-icon v-if="currentPlan.checked" name="checkbox-mark" color="#4cd964" size="80"></u-icon>
          <u-icon v-else name="clock" color="#999" size="80"></u-icon>
          <text class="status-text">{{ currentPlan.checked ? '今日已完成' : '待打卡' }}</text>
        </view>

        <!-- 打卡时间 -->
        <view v-if="currentPlan.checked && currentPlan.checkInTime" class="checkin-time">
          <text>打卡时间: {{ formatDate(currentPlan.checkInTime) }}</text>
        </view>
      </view>

      <!-- Boss 挑战展示 -->
      <view class="boss-section">
        <view class="section-header">
          <text class="section-title">Boss 挑战</text>
          <u-tag text="3个Boss" type="warning" size="mini"></u-tag>
        </view>

        <view class="boss-list">
          <view
            v-for="boss in currentPlan.bosses"
            :key="boss.id"
            class="boss-item"
            :class="{ 'defeated': boss.defeated }"
          >
            <view class="boss-info">
              <text class="boss-name">{{ boss.name }}</text>
              <text class="boss-hp">HP: {{ boss.hp }}/{{ boss.maxHp }}</text>
            </view>
            <u-progress
              :percentage="(boss.hp / boss.maxHp) * 100"
              activeColor="#dd524d"
              :striped="true"
            ></u-progress>
            <u-icon v-if="boss.defeated" name="checkmark-circle" color="#4cd964" size="24"></u-icon>
          </view>
        </view>
      </view>

      <!-- 打卡按钮 -->
      <view class="action-section">
        <u-button
          v-if="!currentPlan.checked"
          type="primary"
          size="large"
          @click="handleCheckIn"
          :loading="checking"
          shape="circle"
        >
          立即打卡
        </u-button>
        <u-button v-else type="info" size="large" disabled shape="circle">
          今日已打卡
        </u-button>
      </view>

      <!-- 打卡历史 -->
      <view class="history-section">
        <view class="section-header">
          <text class="section-title">打卡历史</text>
        </view>

        <u-timeline>
          <u-timeline-item v-if="currentPlan.checked">
            <template v-slot:content>
              <view class="history-item">
                <text class="history-date">{{ formatDate(currentPlan.checkInTime) }}</text>
                <text class="history-result">完成打卡，获得 {{ currentPlan.points }} 积分</text>
              </view>
            </template>
          </u-timeline-item>
          <u-timeline-item v-else>
            <template v-slot:content>
              <view class="history-item">
                <text class="history-empty">暂无打卡记录</text>
              </view>
            </template>
          </u-timeline-item>
        </u-timeline>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <u-icon name="file-text" color="#999" size="100"></u-icon>
      <text class="empty-text">计划不存在</text>
      <u-button type="primary" @click="goBack">返回</u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlanStore } from '@/stores/plan'
import { useCatStore } from '@/stores/cat'
import { storage } from '@/utils/storage'
import { formatDate } from '@/utils/format'

const planStore = usePlanStore()
const catStore = useCatStore()

const planId = ref('')
const checking = ref(false)

// 获取当前计划
const currentPlan = computed(() => {
  return planStore.todayPlans.find(p => p.id === planId.value)
})

// 打卡操作
const handleCheckIn = async () => {
  if (!currentPlan.value) return

  checking.value = true

  try {
    // 模拟打卡延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 执行打卡
    const points = planStore.checkIn(planId.value)

    if (points > 0) {
      // 增加猫咪积分
      catStore.addPoints(points)

      // 打败所有 Boss
      currentPlan.value.bosses.forEach(boss => {
        boss.defeated = true
      })

      // 保存数据
      storage.set('todayPlans', planStore.todayPlans)
      storage.set('catStore', catStore.$state)

      uni.showToast({
        title: `打卡成功！获得 ${points} 积分`,
        icon: 'success',
        duration: 2000
      })
    }
  } catch (error) {
    console.error('打卡失败:', error)
    uni.showToast({
      title: '打卡失败',
      icon: 'none'
    })
  } finally {
    checking.value = false
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 初始化
onMounted(() => {
  // 从 URL 参数获取计划 ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.options || {}
  planId.value = options.id

  // 从本地存储加载计划数据
  const savedPlans = storage.get<any[]>('todayPlans')
  if (savedPlans) {
    planStore.todayPlans = savedPlans
  }

  // 加载猫咪数据
  const savedCat = storage.get<any>('catStore')
  if (savedCat) {
    Object.assign(catStore.$state, savedCat)
  }
})
</script>

<style lang="scss" scoped>
.checkin-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.checkin-content {
  padding: 20rpx;
}

.plan-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .plan-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
    gap: 20rpx;

    .plan-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .plan-description {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 40rpx;
  }

  .checkin-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 0;

    .status-text {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: #666;
    }
  }

  .checkin-time {
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;

    text {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.boss-section,
.history-section {
  margin: 20rpx 0;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.boss-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .boss-item {
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &.defeated {
      opacity: 0.5;
    }

    .boss-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15rpx;

      .boss-name {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .boss-hp {
        font-size: 24rpx;
        color: #dd524d;
      }
    }
  }
}

.action-section {
  margin: 40rpx 0;
  padding: 0 20rpx;

  .u-button {
    width: 100%;
  }
}

.history-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;

  .history-item {
    .history-date {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 10rpx;
    }

    .history-result {
      display: block;
      font-size: 28rpx;
      color: #333;
    }

    .history-empty {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20rpx;

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin: 30rpx 0 40rpx 0;
  }

  .u-button {
    width: 200rpx;
  }
}
</style>