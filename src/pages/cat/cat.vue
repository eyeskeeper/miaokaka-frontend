<template>
  <view class="cat-container">
    <!-- 顶部统计卡片 -->
    <view class="stats-card">
      <view class="stat-item">
        <u-icon name="pets" color="#AED581" size="40"></u-icon>
        <view class="stat-info">
          <text class="stat-value">{{ catStore.cats.length }}</text>
          <text class="stat-label">猫咪数量</text>
        </view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <u-icon name="integral" color="#FFEB3B" size="40"></u-icon>
        <view class="stat-info">
          <text class="stat-value">{{ catStore.totalPoints }}</text>
          <text class="stat-label">总积分</text>
        </view>
      </view>
    </view>

    <!-- 猫咪列表 -->
    <view class="cat-list-section">
      <view class="section-header">
        <text class="section-title">我的猫咪</text>
        <view class="add-cat-btn" @click="showAddCatModal = true">
          <u-icon name="plus" color="#fff" size="20"></u-icon>
        </view>
      </view>

      <view class="cat-list">
        <view
          v-for="cat in catStore.cats"
          :key="cat.id"
          class="cat-item"
          :class="{ 'active': cat.isActive }"
          @click="goToCatDetail(cat.id)"
        >
          <view class="cat-left">
            <u-avatar :src="getCatAvatar(cat.appearance.color)" size="large" shape="square" class="cat-avatar"></u-avatar>
            <view class="cat-info">
              <view class="cat-name-row">
                <text class="cat-name">{{ cat.name }}</text>
                <u-tag v-if="cat.isActive" text="当前" type="success" size="mini"></u-tag>
              </view>
              <view class="cat-level-row">
                <text class="cat-level">LV.{{ cat.level }}</text>
                <text class="cat-points">{{ cat.points }} 积分</text>
              </view>
            </view>
          </view>
          <view class="cat-right">
            <u-icon name="arrow-right" color="#999" size="24"></u-icon>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="catStore.cats.length === 0" class="empty-state">
          <u-icon name="pets" color="#ddd" size="100"></u-icon>
          <text class="empty-text">还没有猫咪，添加一只吧~</text>
          <u-button type="primary" @click="showAddCatModal = true" shape="circle">
            添加猫咪
          </u-button>
        </view>
      </view>
    </view>

    <!-- 添加猫咪弹窗 -->
    <u-popup v-model:show="showAddCatModal" mode="bottom" :round="10">
      <view class="add-cat-popup">
        <view class="popup-header">
          <text class="popup-title">添加新猫咪</text>
          <u-icon name="close" @click="showAddCatModal = false"></u-icon>
        </view>
        <u-form :model="catForm" label-position="top">
          <u-form-item label="猫咪名字">
            <u-input v-model="catForm.name" placeholder="给猫咪取个名字"></u-input>
          </u-form-item>
          <u-form-item label="猫咪颜色">
            <u-radio-group v-model="catForm.appearance.color" placement="row">
              <u-radio
                v-for="color in catColors"
                :key="color.value"
                :name="color.value"
                :custom-style="{ marginRight: '20rpx' }"
              >
                {{ color.label }}
              </u-radio>
            </u-radio-group>
          </u-form-item>
          <u-form-item label="风格">
            <u-radio-group v-model="catForm.appearance.style" placement="row">
              <u-radio
                v-for="style in catStyles"
                :key="style.value"
                :name="style.value"
                :custom-style="{ marginRight: '20rpx' }"
              >
                {{ style.label }}
              </u-radio>
            </u-radio-group>
          </u-form-item>
        </u-form>
        <u-button type="primary" @click="handleAddCat" shape="circle">确定添加</u-button>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCatStore, type CatAppearance } from '@/stores/cat'
import { storage } from '@/utils/storage'

const catStore = useCatStore()

const showAddCatModal = ref(false)
const catForm = ref({
  name: '',
  appearance: {
    color: 'orange',
    style: 'normal'
  } as CatAppearance
})

// 猫咪颜色选项
const catColors = [
  { label: '橘色', value: 'orange' },
  { label: '白色', value: 'white' },
  { label: '黑色', value: 'black' },
  { label: '灰色', value: 'gray' }
]

// 猫咪风格选项
const catStyles = [
  { label: '普通', value: 'normal' },
  { label: '可爱', value: 'cute' },
  { label: '酷炫', value: 'cool' }
]

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

// 跳转到猫咪详情页
const goToCatDetail = (catId: string) => {
  uni.navigateTo({
    url: `/pages/cat/catDetail?id=${catId}`
  })
}

// 添加猫咪
const handleAddCat = () => {
  if (!catForm.value.name) {
    uni.showToast({
      title: '请输入猫咪名字',
      icon: 'none'
    })
    return
  }

  const newCatId = catStore.addCat({
    name: catForm.value.name,
    level: 1,
    exp: 0,
    maxExp: 100,
    points: 0,
    attributes: {
      strength: 10,
      agility: 10,
      intelligence: 10
    },
    appearance: catForm.value.appearance,
    battles: [],
    isActive: false
  })

  uni.showToast({
    title: '添加成功',
    icon: 'success'
  })

  // 重置表单
  catForm.value = {
    name: '',
    appearance: {
      color: 'orange',
      style: 'normal'
    }
  }
  showAddCatModal.value = false

  // 跳转到新猫咪的详情页
  setTimeout(() => {
    goToCatDetail(newCatId)
  }, 500)
}

// 初始化
onMounted(() => {
  // 从本地存储加载数据
  const savedCats = storage.get<any>('catStore')
  if (savedCats) {
    catStore.cats = savedCats.cats || []
    catStore.currentCatId = savedCats.currentCatId || ''
  }

  // 如果没有数据，初始化默认猫咪
  if (catStore.cats.length === 0) {
    catStore.initializeDefaultCats()
  }
})

// 监听猫咪数据变化并保存
watch(() => catStore.$state, (newVal) => {
  storage.set('catStore', newVal)
}, { deep: true })
</script>

<style lang="scss" scoped>
.cat-container {
  min-height: 100vh;
  background: #F9FBE7;
  padding-bottom: 20rpx;
}

.stats-card {
  background: linear-gradient(135deg, #CDDC39 0%, #7CB34A 100%);
  margin: 20rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  color: #fff;

  .stat-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20rpx;

    .stat-info {
      flex: 1;

      .stat-value {
        display: block;
        font-size: 48rpx;
        font-weight: bold;
        margin-bottom: 6rpx;
      }

      .stat-label {
        display: block;
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }

  .stat-divider {
    width: 1rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
  }
}

.cat-list-section {
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

    .add-cat-btn {
      width: 60rpx;
      height: 60rpx;
      background: #AED581;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.cat-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .cat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    transition: all 0.3s;

    &:last-child {
      border-bottom: none;
    }

    &.active {
      background: linear-gradient(135deg, rgba(174, 213, 129, 0.1) 0%, rgba(124, 179, 66, 0.1) 100%);
    }

    &:active {
      background: #f5f5f5;
    }

    .cat-left {
      display: flex;
      align-items: center;
      flex: 1;

      .cat-avatar {
        margin-right: 20rpx;
      }

      .cat-info {
        flex: 1;

        .cat-name-row {
          display: flex;
          align-items: center;
          gap: 10rpx;
          margin-bottom: 6rpx;

          .cat-name {
            font-size: 30rpx;
            font-weight: bold;
            color: #333;
          }
        }

        .cat-level-row {
          display: flex;
          align-items: center;
          gap: 20rpx;

          .cat-level {
            font-size: 24rpx;
            color: #AED581;
            font-weight: bold;
          }

          .cat-points {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;

  .empty-text {
    display: block;
    font-size: 26rpx;
    color: #999;
    margin: 20rpx 0 40rpx 0;
  }

  .u-button {
    width: 200rpx;
  }
}

.add-cat-popup {
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
