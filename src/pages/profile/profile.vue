<template>
  <view class="profile-container">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <u-avatar :src="userStore.avatar" size="100" class="user-avatar"></u-avatar>
      <view class="user-info">
        <text class="user-name">{{ userStore.nickname || '喵星人' }}</text>
        <text class="user-phone">{{ userStore.phone || '未绑定手机号' }}</text>
      </view>
      <view class="edit-btn" @click="editProfile">
        <u-icon name="edit-pen" color="#2979ff" size="24"></u-icon>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-value">{{ catStore.points }}</text>
        <text class="stat-label">积分</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ catStore.level }}</text>
        <text class="stat-label">等级</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ todayCheckInCount }}</text>
        <text class="stat-label">今日打卡</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ totalCheckInCount }}</text>
        <text class="stat-label">累计打卡</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="function-list">
      <u-cell-group>
        <u-cell
          title="我的猫咪"
          is-link
          @click="goToCat"
        >
          <template v-slot:icon>
            <u-icon name="pets" color="#ff9800" size="24" style="margin-right: 10rpx;"></u-icon>
          </template>
        </u-cell>
        <u-cell
          title="打卡记录"
          is-link
          @click="goToHistory"
        >
          <template v-slot:icon>
            <u-icon name="clock" color="#2979ff" size="24" style="margin-right: 10rpx;"></u-icon>
          </template>
        </u-cell>
        <u-cell
          title="我的排名"
          is-link
          @click="goToRanking"
        >
          <template v-slot:icon>
            <u-icon name="list" color="#4cd964" size="24" style="margin-right: 10rpx;"></u-icon>
          </template>
        </u-cell>
        <u-cell
          title="积分明细"
          is-link
          @click="goToPoints"
        >
          <template v-slot:icon>
            <u-icon name="integral" color="#dd524d" size="24" style="margin-right: 10rpx;"></u-icon>
          </template>
        </u-cell>
      </u-cell-group>

      <u-cell-group style="margin-top: 20rpx;">
        <u-cell
          title="个人设置"
          is-link
          @click="goToSettings"
        >
          <template v-slot:icon>
            <u-icon name="setting" color="#909399" size="24" style="margin-right: 10rpx;"></u-icon>
          </template>
        </u-cell>
        <u-cell
          title="关于我们"
          is-link
          @click="goToAbout"
        >
          <template v-slot:icon>
            <u-icon name="info-circle" color="#909399" size="24" style="margin-right: 10rpx;"></u-icon>
          </template>
        </u-cell>
        <u-cell
          title="帮助与反馈"
          is-link
          @click="goToHelp"
        >
          <template v-slot:icon>
            <u-icon name="question-circle" color="#909399" size="24" style="margin-right: 10rpx;"></u-icon>
          </template>
        </u-cell>
      </u-cell-group>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <u-button type="error" size="large" @click="handleLogout" shape="circle">
        退出登录
      </u-button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>每日打卡 v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCatStore } from '@/stores/cat'
import { usePlanStore } from '@/stores/plan'
import { storage } from '@/utils/storage'

const userStore = useUserStore()
const catStore = useCatStore()
const planStore = usePlanStore()

// 今日打卡数量
const todayCheckInCount = computed(() => {
  return planStore.todayPlans.filter(p => p.checked).length
})

// 累计打卡数量
const totalCheckInCount = computed(() => {
  return 28 // 模拟累计打卡数据
})

// 编辑个人资料
const editProfile = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 跳转猫咪页
const goToCat = () => {
  uni.switchTab({
    url: '/pages/cat/cat'
  })
}

// 跳转打卡记录
const goToHistory = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 跳转排行榜
const goToRanking = () => {
  uni.switchTab({
    url: '/pages/ranking/ranking'
  })
}

// 跳转积分明细
const goToPoints = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 跳转设置
const goToSettings = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 跳转关于
const goToAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: '每日打卡是一款游戏化的习惯养成应用，帮助你和你的猫咪一起养成好习惯！',
    showCancel: false
  })
}

// 跳转帮助
const goToHelp = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除登录状态
        userStore.logout()

        // 清除本地存储
        storage.remove('userInfo')

        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })

        // 跳转到登录页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }, 1500)
      }
    }
  })
}

onMounted(() => {
  // 加载用户数据
  const savedUserInfo = storage.get<any>('userInfo')
  if (savedUserInfo) {
    Object.assign(userStore.$state, savedUserInfo)
  }

  const savedCat = storage.get<any>('catStore')
  if (savedCat) {
    Object.assign(catStore.$state, savedCat)
  }

  const savedPlans = storage.get<any[]>('todayPlans')
  if (savedPlans) {
    planStore.todayPlans = savedPlans
  }
})
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20rpx;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  color: #fff;

  .user-avatar {
    margin-right: 30rpx;
  }

  .user-info {
    flex: 1;

    .user-name {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }

    .user-phone {
      display: block;
      font-size: 26rpx;
      opacity: 0.9;
    }
  }

  .edit-btn {
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.stats-section {
  display: flex;
  background: #fff;
  margin: 20rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-value {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      color: #2979ff;
      margin-bottom: 6rpx;
    }

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }

  .stat-divider {
    width: 1rpx;
    background: #f0f0f0;
  }
}

.function-list {
  margin: 20rpx;
}

.logout-section {
  margin: 40rpx 20rpx;

  .u-button {
    width: 100%;
  }
}

.version-info {
  text-align: center;
  padding: 20rpx 0;

  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>