<template>
  <view class="ranking">
    <view class="head pixel-card">
      <image class="pixelated" src="/static/pixel/icon-trophy.png" />
      <view class="head-text">
        <text class="pixel-h2">🏆 全勤连击榜</text>
        <text class="head-sub">当天全部进行中计划都完成才累计全勤</text>
      </view>
    </view>

    <!-- 榜单切换 -->
    <view class="tab-row pixel-card">
      <text class="tab-chip" :class="{ active: tab === 'all' }" @tap="switchTab('all')">🌐 全站</text>
      <text class="tab-chip" :class="{ active: tab === 'friends' }" @tap="switchTab('friends')">👫 好友</text>
    </view>

    <!-- 竖版滚动榜单 -->
    <view class="list-card pixel-card">
      <view
        v-for="item in displayList"
        :key="item.userId"
        class="rank-row"
        :class="[rowClass(item), { me: isMe(item) }]"
      >
        <text class="rank-no" :class="noClass(item)">{{ rankLabel(item.rank) }}</text>
        <view class="rank-avatar" :class="avatarClass(item.rank)">{{ avatarText(item) }}</view>
        <view class="rank-info">
          <text class="rank-name">{{ item.userName }}</text>
          <text v-if="isMe(item)" class="rank-me-tag">（我）</text>
        </view>
        <view class="rank-streak">
          <image class="pixelated" src="/static/pixel/icon-flame.png" />
          <text>{{ item.currentStreak }} 天</text>
        </view>
      </view>

      <view v-if="!rankStore.loading && displayList.length === 0" class="list-empty">
        {{ tab === 'friends' ? '还没有好友，去「我的 → 好友」添加吧！' : '榜单虚位以待，全勤打卡抢第一！' }}
      </view>
      <view v-if="rankStore.loading" class="list-empty">加载中…</view>
    </view>

    <!-- 底部固定：我的排名（后端真实数据，缺字段时退回榜内 userId 匹配） -->
    <view class="mine-bar">
      <view v-if="myRankDisplay != null" class="mine-inner pixel-card">
        <text class="mine-label">我的排名</text>
        <text class="mine-rank">No.{{ myRankDisplay }}</text>
        <view class="mine-streak">
          <image class="pixelated" src="/static/pixel/icon-flame.png" />
          <text>{{ userStore.currentStreak }} 天</text>
        </view>
      </view>
      <view v-else class="mine-inner pixel-card mine-miss">
        <text class="mine-label">我的排名</text>
        <text class="mine-tip">未进入前 50，继续全勤打卡冲榜！</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { getFriendRank } from '@/api/friend'
import { useRankStore } from '@/stores/rank'
import { useUserStore } from '@/stores/user'
import type { RankItemVO } from '@/types/api'

const rankStore = useRankStore()
const userStore = useUserStore()

const myId = computed(() => userStore.userInfo?.id ?? -1)

/** all=全站榜 friends=好友榜 */
const tab = ref<'all' | 'friends'>('all')
const friendRank = ref<RankItemVO[]>([])

function switchTab(t: 'all' | 'friends') {
  tab.value = t
  if (t === 'friends' && friendRank.value.length === 0) {
    getFriendRank()
      .then((d) => {
        friendRank.value = (d || []).map((r, i) => ({ rank: i + 1, ...r }))
      })
      .catch(() => {})
  }
}

/** 好友榜条目映射为与全站榜同构的行（补 rank 序号） */
const displayList = computed(() => {
  if (tab.value !== 'friends') return rankStore.list
  return friendRank.value
    .slice()
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      userName: r.userName,
      userAvatar: r.userAvatar,
      currentStreak: r.currentStreak
    }))
})

const isMe = (item: RankItemVO) => item.userId === myId.value

/** 我的排名展示值：优先后端 myRank 字段，缺字段时退回榜内 userId 匹配（兼容旧后端） */
const myRankDisplay = computed<number | null>(() => {
  if (rankStore.myRank != null) return rankStore.myRank
  return rankStore.list.find((r) => r.userId === myId.value)?.rank ?? null
})

const rankLabel = (rank: number) => (rank <= 3 ? `No.${rank}` : String(rank))

const rowClass = (item: RankItemVO) =>
  ({ 1: 'top-1', 2: 'top-2', 3: 'top-3' } as Record<number, string>)[item.rank] ?? ''

const noClass = (item: RankItemVO) => rowClass(item)

const avatarClass = (rank: number) =>
  ({ 1: 'av-1', 2: 'av-2', 3: 'av-3' } as Record<number, string>)[rank] ?? ''

const avatarText = (item: RankItemVO) => (item.userName || '喵').slice(0, 1)

onShow(() => {
  if (!ensureLogin()) return
  rankStore.fetchRank()
})
</script>

<style lang="scss" scoped>
.ranking {
  padding: 24rpx 24rpx 180rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.head {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: $pixel-purple;

  image {
    width: 72rpx;
    height: 72rpx;
  }

  .head-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: rgba(255, 251, 239, 0.85);
  }
}

.list-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.rank-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  @include pixel-block;
  background: $pixel-card;
  padding: 18rpx 20rpx;

  &.top-1 {
    background: $pixel-yellow;
  }

  &.top-2 {
    background: #eceaf2;
  }

  &.top-3 {
    background: #f3ddc0;
  }

  &.me {
    border: 4rpx solid $pixel-primary;
  }

  .rank-no {
    width: 64rpx;
    text-align: center;
    font-size: 30rpx;
    font-weight: 900;
    color: $pixel-ink-light;
    flex-shrink: 0;

    &.top-1 {
      color: $pixel-primary-dark;
    }

    &.top-2 {
      color: #8a8798;
    }

    &.top-3 {
      color: #b07b3e;
    }
  }

  .rank-avatar {
    width: 72rpx;
    height: 72rpx;
    @include pixel-card($pixel-card-alt);
    border-width: 3rpx;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 900;
    color: $pixel-ink;
    flex-shrink: 0;

    &.av-1 {
      background: $pixel-yellow;
    }

    &.av-2 {
      background: #eceaf2;
    }

    &.av-3 {
      background: #f3ddc0;
    }
  }

  .rank-info {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6rpx;

    .rank-name {
      font-size: 28rpx;
      font-weight: 800;
      color: $pixel-ink;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rank-me-tag {
      font-size: 22rpx;
      font-weight: 800;
      color: $pixel-primary-dark;
      flex-shrink: 0;
    }
  }

  .rank-streak {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    font-weight: 900;
    color: $pixel-green-dark;
    flex-shrink: 0;

    image {
      width: 30rpx;
      height: 30rpx;
    }
  }
}

.list-empty {
  text-align: center;
  font-size: 24rpx;
  color: $pixel-ink-light;
  padding: 24rpx 0;
}

.tab-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;

  .tab-chip {
    padding: 8rpx 24rpx;
    font-size: 24rpx;
    border: 2rpx solid $pixel-ink;
    background: $pixel-card-alt;
    color: $pixel-ink;

    &.active {
      background: $pixel-primary;
      color: #fffbef;
    }
  }
}

/* 底部固定我的排名 */
.mine-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 10;
}

.mine-inner {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: $pixel-yellow;

  .mine-label {
    font-size: 24rpx;
    font-weight: 700;
    color: rgba(74, 55, 40, 0.7);
  }

  .mine-rank {
    flex: 1;
    font-size: 40rpx;
    font-weight: 900;
    color: $pixel-primary-dark;
  }

  .mine-streak {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 28rpx;
    font-weight: 900;
    color: $pixel-ink;

    image {
      width: 32rpx;
      height: 32rpx;
    }
  }

  .mine-tip {
    flex: 1;
    font-size: 24rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  &.mine-miss {
    background: $pixel-card-alt;
  }
}
</style>
