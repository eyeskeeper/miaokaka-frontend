<template>
  <view class="ranking-container">
    <!-- 用户当前排名展示 -->
    <view class="my-rank">
      <view class="my-rank-card" @click="showMyRankDetail">
        <u-avatar :src="userStore.avatar" size="60" class="rank-avatar"></u-avatar>
        <view class="rank-info">
          <text class="rank-name">{{ userStore.nickname || '喵星人' }}</text>
          <text class="rank-desc">
            第 {{ myRank }} 名 · {{ catStore.totalPoints }} 总积分
          </text>
        </view>
        <u-icon name="arrow-right" color="#999" size="24"></u-icon>
      </view>
    </view>

    <!-- 排行榜 -->
    <view class="ranking-list">
      <!-- 前三名特殊展示 -->
      <view class="top-three">
        <view
          v-for="(user, index) in topUsers"
          :key="user.rank"
          class="top-user"
          :class="`rank-${index + 1}`"
        >
          <view class="user-rank">
            <text class="rank-number">{{ user.rank }}</text>
          </view>
          <u-avatar :src="user.avatar" size="80" class="top-avatar"></u-avatar>
          <view class="user-info">
            <text class="user-name">{{ user.nickname }}</text>
            <text class="user-points">{{ user.points }} 积分</text>
          </view>
          <view class="medal">
            <u-icon v-if="index === 0" name="star" color="#CDDC39" size="24"></u-icon>
            <u-icon v-else-if="index === 1" name="star" color="#AED581" size="24"></u-icon>
            <u-icon v-else-if="index === 2" name="star" color="#7CB342" size="24"></u-icon>
          </view>
        </view>
      </view>

      <!-- 普通用户列表 -->
      <view class="normal-rank">
        <view
          v-for="user in normalUsers"
          :key="user.rank"
          class="rank-item"
          @click="showUserDetail(user)"
        >
          <view class="item-rank">
            <text class="rank-text">{{ user.rank }}</text>
          </view>
          <u-avatar :src="user.avatar" size="50" class="item-avatar"></u-avatar>
          <view class="item-info">
            <text class="item-name">{{ user.nickname }}</text>
            <text class="item-points">{{ user.points }} 积分</text>
          </view>
          <u-icon v-if="user.isCurrentUser" name="arrow-right" color="#AED581" size="20"></u-icon>
          <u-tag v-else text="点击查看" type="info" size="mini"></u-tag>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <u-loadmore
      v-if="hasMore"
      status="loading"
      :loading-text="['加载中...']"
      @loadmore="loadMore"
    ></u-loadmore>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCatStore } from '@/stores/cat'
import { useRankingStore } from '@/stores/ranking'
import { storage } from '@/utils/storage'

const userStore = useUserStore()
const catStore = useCatStore()
const rankingStore = useRankingStore()

const page = ref(1)
const pageSize = 10
const hasMore = ref(true)

// 我的排名
const myRank = computed(() => {
  return rankingStore.currentRank || rankingStore.ranks.findIndex(r => r.userId === userStore.userId) + 1 || 100
})

// 前三名用户
const topUsers = computed(() => {
  return rankingStore.ranks.slice(0, 3)
})

// 普通用户列表
const normalUsers = computed(() => {
  return rankingStore.ranks.slice(3, 10).map(user => ({
    ...user,
    isCurrentUser: user.userId === userStore.userId
  }))
})

// 加载排行榜数据
const loadRanking = async () => {
  await rankingStore.fetchRanking()
}

// 加载更多
const loadMore = () => {
  // 模拟加载更多数据
  page.value++
  setTimeout(() => {
    if (page.value > 2) {
      hasMore.value = false
    }
  }, 1000)
}

// 显示用户详情
const showUserDetail = (user: any) => {
  uni.showModal({
    title: user.nickname,
    content: `排名: 第${user.rank}名\n积分: ${user.points}`,
    showCancel: false
  })
}

// 显示我的排名详情
const showMyRankDetail = () => {
  uni.showModal({
    title: '我的排名',
    content: `当前排名: 第${myRank.value}名\n拥有总积分: ${catStore.totalPoints}\n猫咪数量: ${catStore.cats.length}`,
    showCancel: false
  })
}

onMounted(() => {
  // 加载排行榜数据
  loadRanking()

  // 加载用户数据
  const savedUserInfo = storage.get<any>('userInfo')
  if (savedUserInfo) {
    Object.assign(userStore.$state, savedUserInfo)
  }

  const savedCat = storage.get<any>('catStore')
  if (savedCat) {
    Object.assign(catStore.$state, savedCat)
  }
})
</script>

<style lang="scss" scoped>
.ranking-container {
  min-height: 100vh;
  background: #F9FBE7;
  padding-bottom: 20rpx;
}

.my-rank {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .my-rank-card {
    display: flex;
    align-items: center;
    padding: 20rpx;
    border-radius: 15rpx;
    transition: all 0.3s;

    &:active {
      background: #f5f5f5;
    }

    .rank-avatar {
      margin-right: 20rpx;
    }

    .rank-info {
      flex: 1;

      .rank-name {
        display: block;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 6rpx;
      }

      .rank-desc {
        display: block;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.ranking-list {
  margin: 20rpx;
}

.top-three {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;

  .top-user {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-radius: 15rpx;
    margin-bottom: 20rpx;
    transition: all 0.3s;

    &:last-child {
      margin-bottom: 0;
    }

    .rank-1 {
      background: linear-gradient(135deg, #CDDC39 0%, #B2DBBF 100%);
    }

    .rank-2 {
      background: linear-gradient(135deg, #AED581 0%, #81C784 100%);
    }

    .rank-3 {
      background: linear-gradient(135deg, #7CB342 0%, #66BB6A 100%);
    }

    .user-rank {
      width: 60rpx;
      height: 60rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;

      .rank-number {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .top-avatar {
      margin-right: 20rpx;
    }

    .user-info {
      flex: 1;

      .user-name {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 6rpx;
      }

      .user-points {
        display: block;
        font-size: 24rpx;
        color: #666;
      }
    }

    .medal {
      margin-left: 20rpx;
    }
  }
}

.normal-rank {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .rank-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f5f5f5;
    }

    .item-rank {
      width: 50rpx;
      height: 50rpx;
      background: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;

      .rank-text {
        font-size: 24rpx;
        color: #666;
      }
    }

    .item-avatar {
      margin-right: 20rpx;
    }

    .item-info {
      flex: 1;

      .item-name {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 6rpx;
      }

      .item-points {
        display: block;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>