<template>
  <view class="duel-hall">
    <NudgeBubble />
    <!-- 查询栏：ID / 名称 / 描述 -->
    <view class="search-bar pixel-card">
      <view class="search-row">
        <input
          v-model="keyword"
          class="pixel-input search-input"
          :maxlength="30"
          placeholder="搜ID / 名称 / 描述"
          placeholder-class="pixel-placeholder"
          confirm-type="search"
          @confirm="doSearch"
        />
        <button class="pixel-btn-sm" @tap="doSearch">搜索</button>
      </view>
      <view class="cat-row">
        <text
          v-for="c in categories"
          :key="c.value === null ? 'all' : c.value"
          class="pixel-tag cat-chip"
          :class="{ active: category === c.value }"
          @tap="category = c.value"
        >
          {{ c.label }}
        </text>
        <text v-if="keyword || category !== null" class="clear-btn" @tap="clearFilter">✕ 清除筛选</text>
      </view>
    </view>

    <!-- 结果计数 -->
    <view v-if="!loading" class="result-count">
      <text>共 {{ filtered.length }} 场招募中的死斗</text>
    </view>

    <!-- 大厅列表 -->
    <view v-for="duel in filtered" :key="duel.id" class="hall-card pixel-card">
      <view class="flex-between">
        <text class="hall-name">⚔️ {{ duel.duelName }}</text>
        <text class="pixel-tag" :class="duel.joinMode === 1 ? 'jm-approval' : 'jm-free'">
          {{ duel.joinMode === 1 ? '审批制' : '自由制' }}
        </text>
      </view>
      <text v-if="duel.duelDesc" class="hall-desc">{{ duel.duelDesc }}</text>
      <view class="hall-meta">
        <view class="meta-chip"><text>👑 {{ duel.leaderName }}</text></view>
        <view class="meta-chip"><text>👥 {{ duel.memberCount }} 人</text></view>
        <view class="meta-chip coin">
          <image class="pixelated" src="/static/pixel/icon-coin.png" />
          <text>押金 {{ duel.depositPerMember }}</text>
        </view>
        <view class="meta-chip"><text>⏳ {{ duel.totalDays }} 天</text></view>
      </view>
      <view class="flex-between hall-foot">
        <text class="hall-id">#{{ duel.id }}</text>
        <button class="pixel-btn-sm-green" @tap="joinHallDuel(duel)">
          {{ duel.joinMode === 1 ? '申请加入' : '直接加入' }}
        </button>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="empty pixel-card">
      <text class="empty-sub">正在敲开大厅的大门…</text>
    </view>

    <!-- 空状态：无结果 -->
    <view v-else-if="filtered.length === 0 && all.length > 0" class="empty pixel-card">
      <image class="pixelated" src="/static/pixel/icon-sword.png" />
      <text class="empty-title">没有符合条件的死斗</text>
      <text class="empty-sub">换个关键词或清除筛选试试</text>
      <button class="pixel-btn-sm" @tap="clearFilter">清除筛选</button>
    </view>

    <!-- 空状态：大厅没数据 -->
    <view v-else-if="filtered.length === 0" class="empty pixel-card">
      <image class="pixelated" src="/static/pixel/icon-sword.png" />
      <text class="empty-title">大厅空空如也</text>
      <text class="empty-sub">成为第一个亮剑的人！</text>
      <button class="pixel-btn-sm-green" @tap="goCreate">⚔️ 去发起死斗</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import NudgeBubble from '@/components/nudge-bubble/nudge-bubble.vue'
import { ensureLogin } from '@/utils/auth'
import { computed, ref } from 'vue'
import { applyJoinDuel, getRecruitingHall, joinDuel as joinDuelApi } from '@/api/duel'
import { useDuelStore } from '@/stores/duel'
import type { HallDuelVO } from '@/types/api'

const duelStore = useDuelStore()

/** 全量招募数据（招募中 + 我未加入），搜索在本地做 */
const all = ref<HallDuelVO[]>([])
const loading = ref(false)
const keyword = ref('')
/** null=全部 0=自由加入 1=审批加入 */
const category = ref<number | null>(null)
const categories = [
  { label: '全部', value: null },
  { label: '自由加入', value: 0 },
  { label: '审批加入', value: 1 }
] as const

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return all.value.filter((d) => {
    if (category.value !== null && d.joinMode !== category.value) return false
    if (!kw) return true
    // 纯数字优先按 ID 命中，同时保留文本命中
    if (/^\d+$/.test(kw) && d.id === Number(kw)) return true
    return (
      d.duelName.toLowerCase().includes(kw) ||
      (d.duelDesc || '').toLowerCase().includes(kw)
    )
  })
})

function refresh() {
  loading.value = true
  getRecruitingHall(1, 50)
    .then((page) => {
      all.value = (page?.records || []).filter((d) => !d.myRelation && d.status === 0)
    })
    .catch(() => {
      all.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

function doSearch() {
  // 本地过滤由 computed 即时生效，这里仅收起键盘
  uni.hideKeyboard()
}

function clearFilter() {
  keyword.value = ''
  category.value = null
}

function goCreate() {
  uni.navigateTo({ url: '/pages/duel/create' })
}

async function joinHallDuel(duel: HallDuelVO) {
  const approval = duel.joinMode === 1
  const ok = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: approval ? '申请加入死斗' : '加入死斗',
      content: approval
        ? `该死斗需组长审批，确定申请加入「${duel.duelName}」？`
        : `将扣押金 ${duel.depositPerMember} 喵币，确定加入「${duel.duelName}」？`,
      success: (res) => resolve(!!res.confirm)
    })
  })
  if (!ok) return
  try {
    if (approval) {
      await applyJoinDuel(duel.id)
      uni.showToast({ title: '申请已提交，等待组长审批', icon: 'none' })
      refresh()
    } else {
      await joinDuelApi(duel.id)
      uni.showToast({ title: '加入成功！', icon: 'success' })
      duelStore.fetchDuels(true)
      refresh()
    }
  } catch {
    // 余额不足/已满员等，统一提示
  }
}

onShow(() => {
  if (!ensureLogin()) return
  refresh()
})
</script>

<style lang="scss" scoped>
.duel-hall {
  padding: 24rpx 24rpx 60rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.search-bar {
  padding: 20rpx;

  .search-row {
    display: flex;
    gap: 16rpx;
    align-items: center;
  }

  .search-input {
    flex: 1;
    height: 72rpx;
  }

  .cat-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 18rpx;
    flex-wrap: wrap;
  }

  .cat-chip {
    padding: 6rpx 20rpx;

    &.active {
      background: $pixel-primary;
      color: #fffbeF;
    }
  }

  .clear-btn {
    margin-left: auto;
    font-size: 22rpx;
    font-weight: 700;
    color: $pixel-red;
  }
}

.result-count {
  font-size: 22rpx;
  font-weight: 700;
  color: $pixel-ink-light;
}

.hall-card {
  .hall-name {
    @include pixel-title;
    font-size: 30rpx;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .jm-free {
    background: $pixel-blue;
    color: #fff;
  }

  .jm-approval {
    background: $pixel-purple;
    color: #fff;
  }

  .hall-desc {
    display: block;
    margin-top: 10rpx;
    font-size: 24rpx;
    color: $pixel-ink-light;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hall-meta {
    display: flex;
    gap: 12rpx;
    margin-top: 14rpx;
    flex-wrap: wrap;
  }

  .meta-chip {
    display: flex;
    align-items: center;
    gap: 6rpx;
    @include pixel-block;
    padding: 4rpx 12rpx;
    font-size: 20rpx;
    font-weight: 700;
    color: $pixel-ink;

    image {
      width: 24rpx;
      height: 24rpx;
    }

    &.coin {
      color: $pixel-primary-dark;
    }
  }

  .hall-foot {
    margin-top: 16rpx;

    .hall-id {
      font-size: 22rpx;
      font-weight: 700;
      color: $pixel-ink-light;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 60rpx 40rpx;

  image {
    width: 120rpx;
    height: 120rpx;
  }

  .empty-title {
    @include pixel-title;
    font-size: 32rpx;
  }

  .empty-sub {
    font-size: 24rpx;
    color: $pixel-ink-light;
  }
}
</style>
