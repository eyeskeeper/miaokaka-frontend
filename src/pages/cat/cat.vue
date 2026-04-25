<template>
  <view class="cat-container">
    <!-- 猫咪展示区域 -->
    <view class="cat-display">
      <view class="cat-avatar">
        <u-avatar :src="catAvatar" size="large" shape="square" class="avatar"></u-avatar>
      </view>
      <view class="cat-info">
        <text class="cat-name">{{ catStore.name }}</text>
        <u-tag :text="'LV.' + catStore.level" type="primary" size="mini" class="level-tag"></u-tag>
      </view>

      <!-- 经验进度条 -->
      <view class="exp-section">
        <view class="exp-info">
          <text class="exp-text">经验值: {{ catStore.exp }} / {{ catStore.maxExp }}</text>
          <text class="exp-percent">{{ Math.floor(catStore.levelProgress) }}%</text>
        </view>
        <u-line-progress :percentage="catStore.levelProgress" activeColor="#ff9800" :striped="true"></u-line-progress>
      </view>

      <!-- 积分显示 -->
      <view class="points-section">
        <view class="points-card">
          <u-icon name="integral" color="#ff9800" size="60"></u-icon>
          <view class="points-info">
            <text class="points-label">可用积分</text>
            <text class="points-value">{{ catStore.points }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 属性面板 -->
    <view class="attributes-section">
      <view class="section-header">
        <text class="section-title">属性面板</text>
        <u-tag text="升级属性" type="warning" size="mini"></u-tag>
      </view>

      <view class="attributes-list">
        <view class="attribute-item">
          <view class="attr-left">
            <u-icon name="man-add" color="#2979ff" size="40"></u-icon>
            <view class="attr-info">
              <text class="attr-name">力量</text>
              <text class="attr-value">{{ catStore.attributes.strength }}</text>
            </view>
          </view>
          <u-button size="mini" type="primary" @click="upgradeAttribute('strength')">
            +5 (10积分)
          </u-button>
        </view>

        <view class="attribute-item">
          <view class="attr-left">
            <u-icon name="zap" color="#ff9800" size="40"></u-icon>
            <view class="attr-info">
              <text class="attr-name">敏捷</text>
              <text class="attr-value">{{ catStore.attributes.agility }}</text>
            </view>
          </view>
          <u-button size="mini" type="primary" @click="upgradeAttribute('agility')">
            +5 (10积分)
          </u-button>
        </view>

        <view class="attribute-item">
          <view class="attr-left">
            <u-icon name="clock" color="#4cd964" size="40"></u-icon>
            <view class="attr-info">
              <text class="attr-name">智力</text>
              <text class="attr-value">{{ catStore.attributes.intelligence }}</text>
            </view>
          </view>
          <u-button size="mini" type="primary" @click="upgradeAttribute('intelligence')">
            +5 (10积分)
          </u-button>
        </view>
      </view>
    </view>

    <!-- 等级奖励预览 -->
    <view class="rewards-section">
      <view class="section-header">
        <text class="section-title">升级奖励</text>
      </view>
      <view class="rewards-list">
        <view class="reward-item">
          <text class="reward-level">LV.2</text>
          <text class="reward-desc">获得称号"初级勇士"</text>
        </view>
        <view class="reward-item">
          <text class="reward-level">LV.5</text>
          <text class="reward-desc">获得称号"中级勇士"</text>
        </view>
        <view class="reward-item">
          <text class="reward-level">LV.10</text>
          <text class="reward-desc">获得称号"高级勇士"</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCatStore } from '@/stores/cat'
import { storage } from '@/utils/storage'

const catStore = useCatStore()

// 根据猫咪颜色选择头像
const catAvatar = computed(() => {
  const colorMap: Record<string, string> = {
    orange: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png',
    white: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png',
    black: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png'
  }
  return colorMap[catStore.appearance.color] || colorMap.orange
})

// 升级属性
const upgradeAttribute = (type: 'strength' | 'agility' | 'intelligence') => {
  const cost = 10

  if (catStore.points < cost) {
    uni.showToast({
      title: '积分不足',
      icon: 'none'
    })
    return
  }

  const success = catStore.upgradeAttribute(type, cost)
  if (success) {
    uni.showToast({
      title: '升级成功！',
      icon: 'success'
    })
  }
}

// 监听猫咪数据变化并保存
watch(() => catStore.$state, (newVal) => {
  storage.set('catStore', newVal)
}, { deep: true })
</script>

<style lang="scss" scoped>
.cat-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20rpx;
}

.cat-display {
  background: linear-gradient(135deg, #ff9800 0%, #ff6b6b 100%);
  padding: 40rpx 30rpx;
  border-radius: 0 0 40rpx 40rpx;
  color: #fff;

  .cat-avatar {
    text-align: center;
    margin-bottom: 30rpx;

    .avatar {
      background: #fff;
      padding: 20rpx;
    }
  }

  .cat-info {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;

    .cat-name {
      font-size: 40rpx;
      font-weight: bold;
      margin-right: 20rpx;
    }
  }

  .exp-section {
    background: rgba(255, 255, 255, 0.2);
    padding: 20rpx;
    border-radius: 15rpx;
    margin-bottom: 30rpx;

    .exp-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15rpx;

      .exp-text {
        font-size: 24rpx;
      }

      .exp-percent {
        font-size: 24rpx;
        font-weight: bold;
      }
    }
  }

  .points-section {
    .points-card {
      background: rgba(255, 255, 255, 0.3);
      padding: 30rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;

      .points-info {
        margin-left: 30rpx;
        flex: 1;

        .points-label {
          display: block;
          font-size: 24rpx;
          opacity: 0.9;
          margin-bottom: 6rpx;
        }

        .points-value {
          display: block;
          font-size: 48rpx;
          font-weight: bold;
        }
      }
    }
  }
}

.attributes-section,
.rewards-section {
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
  }
}

.attributes-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .attribute-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .attr-left {
      display: flex;
      align-items: center;

      .attr-info {
        margin-left: 20rpx;

        .attr-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 6rpx;
        }

        .attr-value {
          display: block;
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}

.rewards-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .reward-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .reward-level {
      font-size: 28rpx;
      font-weight: bold;
      color: #ff9800;
    }

    .reward-desc {
      font-size: 26rpx;
      color: #666;
    }
  }
}
</style>