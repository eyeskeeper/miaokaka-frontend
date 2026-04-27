<template>
  <view class="cat-detail-container" v-if="cat">
    <!-- 猫咪头部展示 -->
    <view class="cat-header">
      <view class="cat-avatar-section">
        <u-avatar :src="getCatAvatar(cat.appearance.color)" size="120" shape="square" class="avatar"></u-avatar>
        <view class="cat-badge" v-if="cat.isActive">
          <u-icon name="star" color="#FFEB3B" size="16"></u-icon>
          <text class="badge-text">当前猫咪</text>
        </view>
      </view>
      <view class="cat-title">
        <text class="cat-name">{{ cat.name }}</text>
        <u-tag :text="'LV.' + cat.level" type="primary" size="mini" class="level-tag"></u-tag>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <u-button
          v-if="!cat.isActive"
          type="primary"
          size="small"
          @click="handleSwitchCat"
          shape="circle"
        >
          设为当前
        </u-button>
        <u-button type="error" size="small" @click="handleDeleteCat" shape="circle">
          删除
        </u-button>
      </view>
    </view>

    <!-- 经验进度条 -->
    <view class="exp-section">
      <view class="exp-info">
        <text class="exp-text">经验值: {{ cat.exp }} / {{ cat.maxExp }}</text>
        <text class="exp-percent">{{ Math.floor(levelProgress) }}%</text>
      </view>
      <u-line-progress :percentage="levelProgress" activeColor="#AED581" :striped="true"></u-line-progress>
    </view>

    <!-- 积分显示 -->
    <view class="points-section">
      <view class="points-card">
        <u-icon name="integral" color="#FFEB3B" size="60"></u-icon>
        <view class="points-info">
          <text class="points-label">可用积分</text>
          <text class="points-value">{{ cat.points }}</text>
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
            <u-icon name="man-add" color="#CDDC39" size="40"></u-icon>
            <view class="attr-info">
              <text class="attr-name">力量</text>
              <text class="attr-value">{{ cat.attributes.strength }}</text>
            </view>
          </view>
          <u-button size="mini" type="primary" @click="upgradeAttribute('strength')">
            +5 (10积分)
          </u-button>
        </view>

        <view class="attribute-item">
          <view class="attr-left">
            <u-icon name="zap" color="#AED581" size="40"></u-icon>
            <view class="attr-info">
              <text class="attr-name">敏捷</text>
              <text class="attr-value">{{ cat.attributes.agility }}</text>
            </view>
          </view>
          <u-button size="mini" type="primary" @click="upgradeAttribute('agility')">
            +5 (10积分)
          </u-button>
        </view>

        <view class="attribute-item">
          <view class="attr-left">
            <u-icon name="clock" color="#7CB342" size="40"></u-icon>
            <view class="attr-info">
              <text class="attr-name">智力</text>
              <text class="attr-value">{{ cat.attributes.intelligence }}</text>
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
          <text class="reward-level">LV.{{ cat.level + 1 }}</text>
          <text class="reward-desc">属性全+2</text>
        </view>
        <view class="reward-item">
          <text class="reward-level">LV.5</text>
          <text class="reward-desc">获得称号"初级勇士"</text>
        </view>
        <view class="reward-item">
          <text class="reward-level">LV.10</text>
          <text class="reward-desc">获得称号"高级勇士"</text>
        </view>
      </view>
    </view>

    <!-- 战斗记录 -->
    <view class="battles-section" v-if="cat.battles.length > 0">
      <view class="section-header">
        <text class="section-title">战斗记录</text>
      </view>
      <view class="battles-list">
        <view class="battle-item" v-for="(battle, index) in cat.battles" :key="index">
          <text class="battle-text">{{ battle }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-battles">
      <view class="section-header">
        <text class="section-title">战斗记录</text>
      </view>
      <view class="empty-state">
        <u-icon name="file-text" color="#ddd" size="60"></u-icon>
        <text class="empty-text">暂无战斗记录</text>
      </view>
    </view>
  </view>

  <!-- 猫咪不存在 -->
  <view v-else class="not-found">
    <u-icon name="error-circle" color="#999" size="100"></u-icon>
    <text class="not-found-text">猫咪不存在</text>
    <u-button type="primary" @click="goBack" shape="circle">返回</u-button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCatStore } from '@/stores/cat'
import { storage } from '@/utils/storage'

const catStore = useCatStore()
const cat = ref<any>(null)
const catId = ref('')

// 计算经验进度
const levelProgress = computed(() => {
  if (!cat.value) return 0
  return (cat.value.exp / cat.value.maxExp) * 100
})

// 根据猫咪颜色选择头像
const getCatAvatar = (color: string) => {
  const colorMap: Record<string, string> = {
    orange: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png',
    white: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png',
    black: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png',
    gray: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png'
  }
  return colorMap[color] || colorMap.orange
}

// 切换为当前猫咪
const handleSwitchCat = () => {
  if (!cat.value) return

  uni.showModal({
    title: '提示',
    content: `确定要将 ${cat.value.name} 设为当前猫咪吗？`,
    success: (res) => {
      if (res.confirm) {
        const success = catStore.switchCat(cat.value.id)
        if (success) {
          uni.showToast({
            title: '切换成功',
            icon: 'success'
          })
          // 重新加载猫咪数据
          loadCat()
        }
      }
    }
  })
}

// 删除猫咪
const handleDeleteCat = () => {
  if (!cat.value) return

  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${cat.value.name} 吗？此操作不可恢复。`,
    confirmColor: '#FF6F00',
    success: (res) => {
      if (res.confirm) {
        const success = catStore.deleteCat(cat.value.id)
        if (success) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          setTimeout(() => {
            goBack()
          }, 1500)
        }
      }
    }
  })
}

// 升级属性
const upgradeAttribute = (type: 'strength' | 'agility' | 'intelligence') => {
  if (!cat.value) return

  const cost = 10

  if (cat.value.points < cost) {
    uni.showToast({
      title: '积分不足',
      icon: 'none'
    })
    return
  }

  const success = catStore.upgradeAttribute(cat.value.id, type, cost)
  if (success) {
    uni.showToast({
      title: '升级成功！',
      icon: 'success'
    })
    // 重新加载数据
    loadCat()
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 加载猫咪数据
const loadCat = () => {
  if (catId.value) {
    const foundCat = catStore.getCatById(catId.value)
    cat.value = foundCat
  }
}

// 初始化
onMounted(() => {
  // 从 URL 参数获取猫咪 ID
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.options || {}
  catId.value = options.id

  // 从本地存储加载猫咪数据
  const savedCats = storage.get<any>('catStore')
  if (savedCats) {
    catStore.cats = savedCats.cats || []
    catStore.currentCatId = savedCats.currentCatId || ''
  }

  // 加载猫咪
  loadCat()
})

// 监听猫咪数据变化
watch(() => catStore.cats, () => {
  loadCat()
}, { deep: true })
</script>

<style lang="scss" scoped>
.cat-detail-container {
  min-height: 100vh;
  background: #F9FBE7;
  padding-bottom: 20rpx;
}

.cat-header {
  background: linear-gradient(135deg, #CDDC39 0%, #7CB34A 100%);
  padding: 40rpx 30rpx;
  border-radius: 0 0 40rpx 40rpx;
  color: #fff;
  text-align: center;

  .cat-avatar-section {
    position: relative;
    display: inline-block;
    margin-bottom: 30rpx;

    .avatar {
      background: #fff;
      padding: 20rpx;
    }

    .cat-badge {
      position: absolute;
      bottom: -10rpx;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #FFEB3B 0%, #FDD835 100%);
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      gap: 6rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

      .badge-text {
        font-size: 20rpx;
        color: #333;
        font-weight: bold;
      }
    }
  }

  .cat-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: 30rpx;

    .cat-name {
      font-size: 40rpx;
      font-weight: bold;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 20rpx;

    .u-button {
      min-width: 140rpx;
    }
  }
}

.exp-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 20rpx;

  .exp-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15rpx;

    .exp-text {
      font-size: 26rpx;
      color: #666;
    }

    .exp-percent {
      font-size: 26rpx;
      color: #AED581;
      font-weight: bold;
    }
  }
}

.points-section {
  margin: 20rpx;

  .points-card {
    background: #fff;
    padding: 30rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .points-info {
      margin-left: 30rpx;
      flex: 1;

      .points-label {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 6rpx;
      }

      .points-value {
        display: block;
        font-size: 48rpx;
        font-weight: bold;
        color: #AED581;
      }
    }
  }
}

.attributes-section,
.rewards-section,
.battles-section {
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

.rewards-list,
.battles-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .reward-item,
  .battle-item {
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
      color: #C0CA33;
    }

    .reward-desc,
    .battle-text {
      font-size: 26rpx;
      color: #666;
    }
  }
}

.empty-battles {
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

  .empty-state {
    background: #fff;
    border-radius: 20rpx;
    padding: 60rpx;
    text-align: center;

    .empty-text {
      display: block;
      font-size: 26rpx;
      color: #999;
      margin-top: 20rpx;
    }
  }
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20rpx;

  .not-found-text {
    font-size: 28rpx;
    color: #999;
    margin: 30rpx 0 40rpx 0;
  }

  .u-button {
    width: 200rpx;
  }
}
</style>
