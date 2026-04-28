<template>
  <view class="group-container">
    <!-- 我的小组标题 -->
    <view class="header-section">
      <text class="header-title">我的小组</text>
      <text class="header-subtitle">一起打卡，互相鼓励</text>
    </view>

    <!-- 小组列表 -->
    <view v-if="myGroups.length > 0" class="group-list">
      <view
        v-for="group in myGroups"
        :key="group.id"
        class="group-card"
        @click="goToGroupDetail(group.id)"
      >
        <!-- 小组封面 -->
        <view class="group-cover">
          <image :src="group.cover" class="cover-image" mode="aspectFill"></image>
          <view class="cover-badge" :class="group.status">
            {{ group.statusText }}
          </view>
        </view>

        <!-- 小组信息 -->
        <view class="group-info">
          <text class="group-name">{{ group.name }}</text>
          <text class="group-desc">{{ group.description }}</text>

          <!-- 小组统计 -->
          <view class="group-stats">
            <view class="stat-item">
              <u-icon name="man-add" color="#AED581" size="16"></u-icon>
              <text class="stat-text">{{ group.memberCount }}人</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <u-icon name="checkbox-mark" color="#7CB342" size="16"></u-icon>
              <text class="stat-text">{{ group.todayCheckIns }}今日</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <u-icon name="star" color="#FFEB3B" size="16"></u-icon>
              <text class="stat-text">连续{{ group.streak }}天</text>
            </view>
          </view>

          <!-- 打卡进度 -->
          <view class="progress-section">
            <view class="progress-header">
              <text class="progress-label">本周进度</text>
              <text class="progress-value">{{ group.weeklyProgress }}%</text>
            </view>
            <u-line-progress
              :percentage="group.weeklyProgress"
              activeColor="#AED581"
              inactiveColor="#f0f0f0"
              height="8"
            ></u-line-progress>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <view class="empty-icon">
        <u-icon name="man-add" color="#ddd" size="100"></u-icon>
      </view>
      <text class="empty-title">你还没有加入小组</text>
      <text class="empty-desc">快去发现页看看吧，找到志同道合的小伙伴一起打卡！</text>
      <u-button type="primary" @click="goToDiscover" shape="circle" size="large">
        去发现小组
      </u-button>
    </view>

    <!-- 底部提示 -->
    <view v-if="myGroups.length > 0" class="footer-tip">
      <u-icon name="info-circle" color="#999" size="14"></u-icon>
      <text class="tip-text">加入小组后，可以查看成员动态和排行榜</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storage } from '@/utils/storage'

// ===== 类型定义 =====
interface Group {
  id: string
  name: string
  description: string
  cover: string
  memberCount: number
  todayCheckIns: number
  streak: number
  weeklyProgress: number
  status: 'active' | 'hot' | 'new'
  statusText: string
}

// ===== 状态 =====
const myGroups = ref<Group[]>([])

// ===== 模拟数据 =====
const mockGroups: Group[] = [
  {
    id: '1',
    name: '晨跑运动打卡团',
    description: '每天早起晨跑，健康生活从脚下开始',
    cover: 'https://picsum.photos/400/200?random=1',
    memberCount: 128,
    todayCheckIns: 87,
    streak: 15,
    weeklyProgress: 85,
    status: 'hot',
    statusText: '热门'
  },
  {
    id: '2',
    name: '阅读爱好者联盟',
    description: '每天阅读30分钟，分享读书心得',
    cover: 'https://picsum.photos/400/200?random=2',
    memberCount: 256,
    todayCheckIns: 198,
    streak: 23,
    weeklyProgress: 92,
    status: 'active',
    statusText: '活跃'
  },
  {
    id: '3',
    name: '健康喝水小队',
    description: '每天8杯水，养成好习惯',
    cover: 'https://picsum.photos/400/200?random=3',
    memberCount: 89,
    todayCheckIns: 45,
    streak: 7,
    weeklyProgress: 65,
    status: 'new',
    statusText: '新组'
  }
]

// ===== 方法 =====

// 跳转到小组详情
const goToGroupDetail = (groupId: string) => {
  uni.navigateTo({
    url: `/pages/group/groupDetail?id=${groupId}`
  })
}

// 跳转到发现页
const goToDiscover = () => {
  uni.showToast({
    title: '发现页开发中',
    icon: 'none'
  })
}

// ===== 数据加载 =====
// 预留的 API 接口调用位置
const fetchMyGroups = async () => {
  // TODO: 替换为实际的 API 调用
  // 示例:
  // const response = await uni.request({
  //   url: '/api/groups/my',
  //   method: 'GET'
  // })
  // myGroups.value = response.data

  // 临时使用模拟数据
  loadMockData()
}

// 加载模拟数据
const loadMockData = () => {
  // 尝试从本地存储加载
  const savedGroups = storage.get<Group[]>('myGroups')
  if (savedGroups && savedGroups.length > 0) {
    myGroups.value = savedGroups
  } else {
    // 使用模拟数据
    myGroups.value = mockGroups
    storage.set('myGroups', mockGroups)
  }
}

// ===== 初始化 =====
fetchMyGroups()
</script>

<style lang="scss" scoped>
.group-container {
  min-height: 100vh;
  background: #F9FBE7;
  padding-bottom: 40rpx;
}

// 头部区域
.header-section {
  background: linear-gradient(135deg, #CDDC39 0%, #8BC34A 100%);
  padding: 60rpx 40rpx 40rpx;
  color: #fff;

  .header-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  .header-subtitle {
    display: block;
    font-size: 26rpx;
    opacity: 0.9;
  }
}

// 小组列表
.group-list {
  padding: 20rpx;
}

.group-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  // 小组封面
  .group-cover {
    position: relative;
    height: 200rpx;

    .cover-image {
      width: 100%;
      height: 100%;
    }

    .cover-badge {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      color: #fff;

      &.hot {
        background: linear-gradient(135deg, #FF6F00 0%, #FF9800 100%);
      }

      &.active {
        background: linear-gradient(135deg, #7CB342 0%, #AED581 100%);
      }

      &.new {
        background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
      }
    }
  }

  // 小组信息
  .group-info {
    padding: 30rpx;

    .group-name {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 10rpx;
    }

    .group-desc {
      display: block;
      font-size: 26rpx;
      color: #999;
      margin-bottom: 20rpx;
      line-height: 1.5;
    }

    // 小组统计
    .group-stats {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6rpx;

        .stat-text {
          font-size: 24rpx;
          color: #666;
        }
      }

      .stat-divider {
        width: 1rpx;
        height: 20rpx;
        background: #f0f0f0;
        margin: 0 16rpx;
      }
    }

    // 进度区域
    .progress-section {
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;

        .progress-label {
          font-size: 24rpx;
          color: #666;
        }

        .progress-value {
          font-size: 24rpx;
          font-weight: bold;
          color: #AED581;
        }
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;

  .empty-icon {
    margin-bottom: 30rpx;
  }

  .empty-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }

  .empty-desc {
    display: block;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 40rpx;
    line-height: 1.6;
    max-width: 400rpx;
  }

  .u-button {
    width: 300rpx;
  }
}

// 底部提示
.footer-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin: 0 40rpx;
  padding: 20rpx;

  .tip-text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
