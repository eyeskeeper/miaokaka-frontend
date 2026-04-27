<template>
  <view class="index-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <u-avatar :src="userStore.avatar" size="80" class="avatar"></u-avatar>
        <view class="info-text">
          <text class="nickname">{{ userStore.nickname || '喵星人' }}</text>
          <text class="welcome">今天也要加油哦！</text>
        </view>
      </view>
      <view class="stats">
        <view class="stat-item">
          <text class="stat-value">{{ currentCat?.points || 0 }}</text>
          <u-icon name="integral" color="#fff" size="16"></u-icon>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ todayCheckInCount }}</text>
          <u-icon name="clock" color="#fff" size="16"></u-icon>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ currentCat?.level || 1 }}</text>
          <u-icon name="star" color="#fff" size="16"></u-icon>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-actions">
      <u-grid :border="false" :col="4">
        <u-grid-item @click="goToCheckin">
          <u-icon name="clock" color="#CDDC39" size="40"></u-icon>
          <text class="grid-text">打卡</text>
        </u-grid-item>
        <u-grid-item @click="goToCat">
          <u-icon name="heart" color="#AED581" size="40"></u-icon>
          <text class="grid-text">猫咪</text>
        </u-grid-item>
        <u-grid-item @click="goToRanking">
          <u-icon name="list" color="#7CB342" size="40"></u-icon>
          <text class="grid-text">排行</text>
        </u-grid-item>
        <u-grid-item @click="goToProfile">
          <u-icon name="account" color="#C0CA33" size="40"></u-icon>
          <text class="grid-text">我的</text>
        </u-grid-item>
      </u-grid>
    </view>

    <!-- 今日计划列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">今日计划</text>
        <view class="add-btn" @click="showAddPlan = true">
          <u-icon name="plus" color="#AED581"></u-icon>
        </view>
      </view>

      <view class="plan-list">
        <view v-if="planStore.todayPlans.length === 0" class="empty-state">
          <u-icon name="file-text" color="#999" size="80"></u-icon>
          <text class="empty-text">还没有计划，添加一个吧~</text>
        </view>
        <view v-else class="plan-items">
          <view
            v-for="plan in planStore.todayPlans"
            :key="plan.id"
            class="plan-item"
            @click="goToCheckin(plan.id)"
          >
            <view class="plan-left">
              <view class="plan-icon" :class="{ 'checked': plan.checked }">
                <u-icon v-if="plan.checked" name="checkbox-mark" color="#fff"></u-icon>
              </view>
              <view class="plan-content">
                <text class="plan-title" :class="{ 'checked': plan.checked }">{{ plan.title }}</text>
                <text class="plan-desc">{{ plan.description }}</text>
              </view>
            </view>
            <view class="plan-right">
              <u-tag :text="plan.points + '积分'" type="success" size="mini"></u-tag>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加计划弹窗 -->
    <u-popup v-model:show="showAddPlan" mode="bottom" :round="10">
      <view class="add-plan-popup">
        <view class="popup-header">
          <text class="popup-title">添加计划</text>
          <u-icon name="close" @click="showAddPlan = false"></u-icon>
        </view>
        <u-form :model="planForm" label-position="top">
          <u-form-item label="计划名称">
            <u-input v-model="planForm.title" placeholder="例如：晨跑3公里"></u-input>
          </u-form-item>
          <u-form-item label="计划描述">
            <u-textarea v-model="planForm.description" placeholder="详细描述你的计划..."></u-textarea>
          </u-form-item>
          <u-form-item label="积分奖励">
            <u-input v-model="planForm.points" type="number" placeholder="输入积分数值"></u-input>
          </u-form-item>
        </u-form>
        <u-button type="primary" @click="addPlan">确定添加</u-button>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCatStore } from '@/stores/cat'
import { usePlanStore, type Plan } from '@/stores/plan'
import { storage } from '@/utils/storage'

const userStore = useUserStore()
const catStore = useCatStore()
const planStore = usePlanStore()

const showAddPlan = ref(false)
const planForm = ref({
  title: '',
  description: '',
  points: 10
})

// 当前猫咪
const currentCat = computed(() => catStore.currentCat)

// 今日打卡数量
const todayCheckInCount = computed(() => {
  return planStore.todayPlans.filter(p => p.checked).length
})

// 跳转打卡页
const goToCheckin = (planId?: string) => {
  if (planId) {
    uni.navigateTo({
      url: `/pages/checkin/checkin?id=${planId}`
    })
  } else {
    uni.navigateTo({
      url: '/pages/checkin/checkin'
    })
  }
}

// 跳转猫咪页
const goToCat = () => {
  uni.switchTab({
    url: '/pages/cat/cat'
  })
}

// 跳转排行榜页
const goToRanking = () => {
  uni.switchTab({
    url: '/pages/ranking/ranking'
  })
}

// 跳转我的页面
const goToProfile = () => {
  uni.switchTab({
    url: '/pages/profile/profile'
  })
}

// 添加计划
const addPlan = () => {
  if (!planForm.value.title) {
    uni.showToast({
      title: '请输入计划名称',
      icon: 'none'
    })
    return
  }

  const newPlan: Plan = {
    id: Date.now().toString(),
    title: planForm.value.title,
    description: planForm.value.description || '',
    points: parseInt(planForm.value.points) || 10,
    checked: false,
    bosses: planStore.generateBosses(Date.now().toString())
  }

  planStore.addPlan(newPlan)

  uni.showToast({
    title: '添加成功',
    icon: 'success'
  })

  // 重置表单
  planForm.value = {
    title: '',
    description: '',
    points: 10
  }
  showAddPlan.value = false
}

// 初始化数据
onMounted(() => {
  // 从本地存储加载数据
  const savedPlans = storage.get<any[]>('todayPlans')
  if (savedPlans) {
    planStore.todayPlans = savedPlans
  }

  const savedCat = storage.get<any>('catStore')
  if (savedCat) {
    Object.assign(catStore.$state, savedCat)
  }

  // 如果没有猫咪数据，初始化默认猫咪
  if (catStore.cats.length === 0) {
    catStore.initializeDefaultCats()
  }

  // 如果没有数据，初始化默认计划
  if (planStore.todayPlans.length === 0) {
    const defaultPlans: Plan[] = [
      {
        id: '1',
        title: '晨跑3公里',
        description: '早起锻炼，保持健康',
        points: 20,
        checked: false,
        bosses: planStore.generateBosses('1')
      },
      {
        id: '2',
        title: '阅读30分钟',
        description: '学习新知识',
        points: 15,
        checked: false,
        bosses: planStore.generateBosses('2')
      },
      {
        id: '3',
        title: '喝8杯水',
        description: '保持水分摄入',
        points: 10,
        checked: false,
        bosses: planStore.generateBosses('3')
      }
    ]
    planStore.todayPlans = defaultPlans
  }
})

// 监听计划变化并保存
watch(() => planStore.todayPlans, (newVal) => {
  storage.set('todayPlans', newVal)
}, { deep: true })

// 监听猫咪数据变化并保存
watch(() => catStore.$state, (newVal) => {
  storage.set('catStore', newVal)
}, { deep: true })
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background-color: #F9FBE7;
  padding-bottom: 20rpx;
}

.user-card {
  background: linear-gradient(135deg, #CDDC39 0%, #8BC34A 100%);
  margin: 20rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  color: #fff;

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .avatar {
      margin-right: 20rpx;
    }

    .info-text {
      flex: 1;

      .nickname {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
      }

      .welcome {
        display: block;
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }

  .stats {
    display: flex;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.2);
    padding: 20rpx 0;
    border-radius: 10rpx;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 6rpx;
      }

      .stat-label {
        display: block;
        font-size: 22rpx;
        opacity: 0.9;
      }
    }

    .stat-divider {
      width: 1rpx;
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.quick-actions {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .grid-text {
    font-size: 24rpx;
    color: #666;
    margin-top: 10rpx;
    display: block;
  }
}

.section {
  margin: 20rpx;

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

    .add-btn {
      width: 50rpx;
      height: 50rpx;
      background: #AED581;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .plan-list {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;

    .empty-state {
      text-align: center;
      padding: 80rpx 0;

      .empty-text {
        display: block;
        font-size: 26rpx;
        color: #999;
        margin-top: 20rpx;
      }
    }

    .plan-items {
      .plan-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .plan-left {
          display: flex;
          align-items: center;
          flex: 1;

          .plan-icon {
            width: 40rpx;
            height: 40rpx;
            border: 2rpx solid #ddd;
            border-radius: 50%;
            margin-right: 20rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;

            &.checked {
              background: #7CB342;
              border-color: #7CB342;
            }
          }

          .plan-content {
            flex: 1;

            .plan-title {
              display: block;
              font-size: 30rpx;
              color: #333;
              margin-bottom: 6rpx;

              &.checked {
                text-decoration: line-through;
                color: #999;
              }
            }

            .plan-desc {
              display: block;
              font-size: 24rpx;
              color: #999;
            }
          }
        }
      }
    }
  }
}

.add-plan-popup {
  padding: 40rpx;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
    }
  }

  .u-form-item {
    margin-bottom: 30rpx;
  }

  .u-button {
    margin-top: 40rpx;
  }
}
</style>
