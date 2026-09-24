<template>
  <view class="profile">
    <NudgeBubble />
    <!-- 用户卡 -->
    <view class="user-card pixel-card">
      <view class="avatar">{{ userStore.displayName.slice(0, 1) }}</view>
      <view class="user-info">
        <text class="user-name">{{ userStore.displayName }}</text>
        <text class="user-account">@{{ userStore.userInfo?.userAccount || '' }}</text>
      </view>
      <view class="user-stats">
        <view class="us" @tap="goWallet">
          <text class="us-num">{{ userStore.totalPoints }}</text>
          <text class="us-label">喵币</text>
        </view>
        <view class="us">
          <text class="us-num">{{ userStore.currentStreak }}</text>
          <text class="us-label">全勤连击</text>
        </view>
        <view class="us">
          <text class="us-num">{{ planStore.cats.length }}</text>
          <text class="us-label">猫口</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="menu pixel-card">
      <view class="menu-row" @tap="goMessages">
        <text class="menu-icon">📬</text>
        <text class="menu-text">消息</text>
        <text v-if="notifyStore.unread > 0" class="menu-badge">
          {{ notifyStore.unread > 99 ? '99+' : notifyStore.unread }}
        </text>
        <text class="menu-arrow">▶</text>
      </view>
      <view class="menu-row" @tap="goWallet">
        <text class="menu-icon">🪙</text>
        <text class="menu-text">喵币钱包</text>
        <text class="menu-arrow">▶</text>
      </view>
      <view class="menu-row" @tap="goRanking">
        <text class="menu-icon">🏆</text>
        <text class="menu-text">全勤排行榜</text>
        <text class="menu-arrow">▶</text>
      </view>
      <view class="menu-row" @tap="goDen">
        <text class="menu-icon">🏠</text>
        <text class="menu-text">我的猫窝</text>
        <text class="menu-arrow">▶</text>
      </view>
      <view v-if="isAdmin" class="menu-row" @tap="goAdminUsers">
        <text class="menu-icon">🛡</text>
        <text class="menu-text">用户管理</text>
        <text class="menu-arrow">▶</text>
      </view>
    </view>

    <!-- 其他 -->
    <view class="menu pixel-card">
      <view class="menu-row" @tap="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于 {{ APP_NAME }}</text>
        <text class="menu-arrow">▶</text>
      </view>
      <view class="menu-row logout" @tap="confirmLogout">
        <text class="menu-icon">🚪</text>
        <text class="menu-text logout-text">退出登录</text>
        <text class="menu-arrow">▶</text>
      </view>
    </view>

    <text class="foot">{{ APP_NAME }} · 打卡喂猫，习惯成自然</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import NudgeBubble from '@/components/nudge-bubble/nudge-bubble.vue'
import { APP_NAME } from '@/config'
import { useNotificationStore } from '@/stores/notification'
import { usePlanStore } from '@/stores/plan'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const planStore = usePlanStore()
const notifyStore = useNotificationStore()

const isAdmin = computed(() => userStore.userInfo?.userRole === 'admin')

onShow(() => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/login' })
    return
  }
  userStore.fetchMe()
  planStore.fetchPlans()
  notifyStore.refreshUnread()
})

function goMessages() {
  uni.navigateTo({ url: '/pages/profile/messages' })
}

function goWallet() {
  uni.navigateTo({ url: '/pages/wallet/wallet' })
}

function goRanking() {
  uni.navigateTo({ url: '/pages/ranking/ranking' })
}

function goDen() {
  uni.switchTab({ url: '/pages/cat/den' })
}

function goAdminUsers() {
  uni.navigateTo({ url: '/pages/admin/users' })
}

function showAbout() {
  uni.showModal({
    title: APP_NAME,
    content: '打卡 + 猫咪养成 + 习惯死斗。每建一个计划领养一只猫精灵，打卡打 BOSS 赚喵币，押金死斗和好友互卷！',
    showCancel: false
  })
}

function confirmLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmColor: '#D95763',
    success: (res) => {
      if (res.confirm) userStore.logout()
    }
  })
}
</script>

<style lang="scss" scoped>
.profile {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 24rpx;
  background: $pixel-green;

  .avatar {
    width: 128rpx;
    height: 128rpx;
    @include pixel-card(#fff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56rpx;
    font-weight: 900;
    color: $pixel-green-dark;
  }

  .user-info {
    margin-top: 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .user-name {
    font-size: 34rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .user-account {
    margin-top: 4rpx;
    font-size: 22rpx;
    color: rgba(74, 55, 40, 0.6);
  }

  .user-stats {
    display: flex;
    gap: 20rpx;
    margin-top: 28rpx;
    width: 100%;
  }

  .us {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    @include pixel-block;
    background: rgba(255, 251, 239, 0.9);
    padding: 14rpx 0;

    .us-num {
      font-size: 32rpx;
      font-weight: 900;
      color: $pixel-ink;
    }

    .us-label {
      font-size: 18rpx;
      color: $pixel-ink-light;
    }
  }
}

.menu {
  padding: 8rpx 24rpx;

  .menu-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 28rpx 0;
    border-bottom: 3rpx solid $pixel-card-alt;

    &:last-child {
      border-bottom: none;
    }

    .menu-icon {
      font-size: 32rpx;
    }

    .menu-text {
      flex: 1;
      font-size: 28rpx;
      font-weight: 700;
      color: $pixel-ink;
    }

    .logout-text {
      color: $pixel-red;
    }

    .menu-badge {
      @include pixel-block($pixel-red);
      padding: 2rpx 12rpx;
      font-size: 20rpx;
      font-weight: 900;
      color: #fffbef;
    }

    .menu-arrow {
      font-size: 20rpx;
      color: $pixel-ink-light;
    }
  }
}

.foot {
  margin-top: 8rpx;
  text-align: center;
  font-size: 20rpx;
  color: $pixel-ink-light;
}
</style>
