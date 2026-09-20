<template>
  <view class="messages">
    <!-- 头部：全部已读 -->
    <view v-if="list.length" class="head pixel-card">
      <text class="pixel-h2">📬 全部消息</text>
      <button
        class="pixel-btn-sm read-all-btn"
        :disabled="markingAll || !list.some((n) => !n.isRead)"
        @tap="markAll"
      >
        全部已读
      </button>
    </view>

    <!-- 消息列表 -->
    <view
      v-for="n in list"
      :key="n.id"
      class="msg-item pixel-card"
      :class="{ read: n.isRead }"
      @tap="tapItem(n)"
    >
      <text class="m-icon">{{ typeIcon(n.type) }}</text>
      <view class="m-body">
        <view class="m-line1">
          <text class="m-title">{{ n.title }}</text>
          <text v-if="!n.isRead" class="m-dot" />
        </view>
        <text class="m-content">{{ n.content }}</text>
        <text class="m-time">{{ formatDate(n.createTime) }}</text>
      </view>
      <text v-if="n.refId" class="m-go">▶</text>
    </view>

    <!-- 加载更多 -->
    <button v-if="hasMore && list.length" class="pixel-btn load-more" :loading="loading" @tap="loadMore">
      加载更多
    </button>

    <!-- 空状态 -->
    <view v-if="!loading && list.length === 0" class="empty pixel-card">
      <image class="pixelated" src="/static/pixel/icon-bell.png" />
      <text class="empty-title">还没有消息</text>
      <text class="empty-sub">死斗变动、审核结果都会通知你</text>
    </view>

    <view v-if="loading && list.length === 0" class="empty pixel-card">
      <text class="empty-sub">正在翻找信箱…</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { computed, ref } from 'vue'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '@/api/notification'
import { useNotificationStore } from '@/stores/notification'
import { formatDate } from '@/utils/format'
import type { NotificationVO } from '@/types/api'

const PAGE_SIZE = 20

const notifyStore = useNotificationStore()

const list = ref<NotificationVO[]>([])
const page = ref(1)
const pages = ref(1)
const loading = ref(false)
const markingAll = ref(false)

const hasMore = computed(() => page.value < pages.value)

async function loadPage(next: number, reset: boolean) {
  if (loading.value) return
  loading.value = true
  try {
    const data = await getNotifications(next, PAGE_SIZE)
    const records = data?.records || []
    list.value = reset ? records : [...list.value, ...records]
    page.value = data?.current || next
    pages.value = data?.pages || 1
  } catch {
    // 统一提示
  } finally {
    loading.value = false
  }
}

function loadMore() {
  loadPage(page.value + 1, false)
}

function typeIcon(type: number) {
  // 见后端 NotificationConstant：1=被移除出死斗
  return ({ 1: '⚔️' } as Record<number, string>)[type] ?? '📢'
}

async function tapItem(n: NotificationVO) {
  if (!n.isRead) {
    try {
      await markNotificationRead(n.id)
      n.isRead = true
      notifyStore.refreshUnread()
    } catch {
      // 统一提示
    }
  }
  if (n.refId) {
    uni.navigateTo({ url: `/pages/duel/detail?id=${n.refId}` })
  }
}

async function markAll() {
  if (markingAll.value) return
  markingAll.value = true
  try {
    const count = await markAllNotificationsRead()
    uni.showToast({ title: `已读 ${count ?? 0} 条消息`, icon: 'none' })
    await loadPage(1, true)
    notifyStore.refreshUnread()
  } catch {
    // 统一提示
  } finally {
    markingAll.value = false
  }
}

onShow(() => {
  if (!ensureLogin()) return
  loadPage(1, true)
  notifyStore.refreshUnread()
})
</script>

<style lang="scss" scoped>
.messages {
  padding: 24rpx 24rpx 60rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;

  .read-all-btn {
    margin: 0;
  }
}

.msg-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;

  .m-icon {
    font-size: 36rpx;
    line-height: 1.2;
  }

  .m-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .m-line1 {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .m-title {
    font-size: 28rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .m-dot {
    width: 14rpx;
    height: 14rpx;
    background: $pixel-red;
    border: 2rpx solid $pixel-ink;
  }

  .m-content {
    font-size: 24rpx;
    color: $pixel-ink-light;
    line-height: 1.5;
  }

  .m-time {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }

  .m-go {
    font-size: 20rpx;
    color: $pixel-ink-light;
    padding-top: 6rpx;
  }

  // 已读消息弱化
  &.read {
    opacity: 0.65;

    .m-title {
      font-weight: 700;
    }
  }
}

.load-more {
  margin-top: 4rpx;
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
