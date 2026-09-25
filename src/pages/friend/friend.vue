<template>
  <view class="page">
    <!-- 好友申请 -->
    <view class="pixel-card section">
      <view class="flex-between">
        <text class="pixel-h2">📨 收到的申请</text>
        <button class="pixel-btn-sm" :loading="loadingApps" @tap="loadApps">刷新</button>
      </view>
      <view v-for="a in applications" :key="a.id" class="apply-row">
        <view class="avatar">{{ (a.userName || '?').slice(0, 1) }}</view>
        <text class="apply-name">{{ a.userName }}</text>
        <view class="apply-ops">
          <button class="pixel-btn-sm-green" @tap="doAgree(a)">同意</button>
          <button class="pixel-btn-sm-red" @tap="doReject(a)">拒绝</button>
        </view>
      </view>
      <text v-if="applications.length === 0" class="empty-line">暂无待处理申请</text>
    </view>

    <!-- 添加好友 -->
    <view class="pixel-card section">
      <text class="pixel-h2">➕ 添加好友</text>
      <view class="add-row">
        <input
          v-model="keyword"
          class="pixel-input add-input"
          :maxlength="32"
          placeholder="对方账号或用户 id"
          placeholder-class="pixel-placeholder"
        />
        <button class="pixel-btn-sm-green" :loading="searching" @tap="doSearch">搜索</button>
      </view>
      <view v-if="found" class="found-row">
        <text class="found-name">{{ found.userName }}（{{ found.userAccount }}）</text>
        <button class="pixel-btn-sm-green" :loading="applying" @tap="doApply">发申请</button>
      </view>
    </view>

    <!-- 好友列表 -->
    <view class="pixel-card section">
      <text class="pixel-h2">👥 我的好友（{{ friends.length }}）</text>
      <view v-for="f in friends" :key="f.userId" class="friend-row">
        <view class="avatar">{{ (f.userName || '?').slice(0, 1) }}</view>
        <view class="friend-info" @tap="goDetail(f)">
          <text class="friend-name">{{ f.userName }}</text>
          <text class="friend-streak">🔥 全勤 {{ f.currentStreak }} 天 · 点此围观</text>
        </view>
        <button class="pixel-btn-sm-red" @tap="doRemove(f)">删除</button>
      </view>
      <text v-if="friends.length === 0" class="empty-line">还没有好友，快去添加吧</text>
    </view>

    <!-- 好友动态 -->
    <view class="pixel-card section">
      <view class="flex-between">
        <text class="pixel-h2">📰 好友动态</text>
        <button class="pixel-btn-sm" :loading="loadingFeed" @tap="loadFeed">刷新</button>
      </view>
      <view v-for="f in feed" :key="f.recordId" class="feed-row">
        <view class="feed-main">
          <text class="feed-title">{{ f.friendName }} · {{ f.planName }}</text>
          <text class="feed-sub">{{ f.checkInDate }}{{ f.status === 1 ? ' · 补卡' : '' }} · 👍 {{ f.likeCount }}</text>
        </view>
        <button
          class="pixel-btn-sm like-btn"
          :class="{ liked: f.likedByMe }"
          :disabled="f.likedByMe"
          @tap="doLike(f)"
        >
          {{ f.likedByMe ? '已赞' : '👍 点赞送小鱼干' }}
        </button>
      </view>
      <text v-if="feed.length === 0" class="empty-line">好友最近 7 天还没有打卡动态</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import {
  agreeFriendApplication,
  applyFriend,
  getFriendApplications,
  getFriendFeed,
  getFriendList,
  likeCheckIn,
  rejectFriendApplication,
  removeFriend,
  searchUser
} from '@/api/friend'
import { ensureLogin } from '@/utils/auth'
import type {
  FriendApplicationVO,
  FriendFeedItemVO,
  FriendSearchVO,
  FriendVO
} from '@/types/api'

const applications = ref<FriendApplicationVO[]>([])
const friends = ref<FriendVO[]>([])
const feed = ref<FriendFeedItemVO[]>([])
const loadingApps = ref(false)
const loadingFeed = ref(false)
const keyword = ref('')
const found = ref<FriendSearchVO | null>(null)
const searching = ref(false)
const applying = ref(false)

onShow(() => {
  if (!ensureLogin()) return
  loadApps()
  loadFriends()
  loadFeed()
})

function loadApps() {
  loadingApps.value = true
  getFriendApplications()
    .then((d) => (applications.value = d || []))
    .catch(() => {})
    .finally(() => (loadingApps.value = false))
}

function loadFriends() {
  getFriendList()
    .then((d) => (friends.value = d || []))
    .catch(() => {})
}

function loadFeed() {
  loadingFeed.value = true
  getFriendFeed()
    .then((d) => (feed.value = d || []))
    .catch(() => {})
    .finally(() => (loadingFeed.value = false))
}

function doSearch() {
  if (!keyword.value.trim() || searching.value) return
  searching.value = true
  searchUser(keyword.value.trim())
    .then((d) => (found.value = d))
    .catch(() => {})
    .finally(() => (searching.value = false))
}

async function doApply() {
  if (!found.value || applying.value) return
  applying.value = true
  try {
    await applyFriend(found.value.userId)
    uni.showToast({ title: '申请已发送', icon: 'none' })
  } catch {
    // 统一提示
  } finally {
    applying.value = false
  }
}

async function doAgree(a: FriendApplicationVO) {
  try {
    await agreeFriendApplication(a.id)
    uni.showToast({ title: '已同意，你们成为好友啦', icon: 'none' })
    loadApps()
    loadFriends()
  } catch {
    // 统一提示
  }
}

async function doReject(a: FriendApplicationVO) {
  try {
    await rejectFriendApplication(a.id)
    loadApps()
  } catch {
    // 统一提示
  }
}

async function doRemove(f: FriendVO) {
  const done = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '删除好友',
      content: `删除「${f.userName}」？双方好友关系解除`,
      success: (r) => resolve(!!r.confirm)
    })
  })
  if (!done) return
  try {
    await removeFriend(f.userId)
    uni.showToast({ title: '已删除', icon: 'none' })
    loadFriends()
  } catch {
    // 统一提示
  }
}

async function doLike(f: FriendFeedItemVO) {
  if (f.likedByMe) return
  try {
    const r = await likeCheckIn(f.recordId)
    f.likeCount = r.likeCount
    f.likedByMe = true
    uni.showToast({ title: '已点赞，对方获得 1 条小鱼干', icon: 'none' })
  } catch {
    // 统一提示
  }
}

function goDetail(f: FriendVO) {
  uni.navigateTo({ url: `/pages/friend/friend-detail?friendId=${f.userId}` })
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.apply-row,
.friend-row,
.feed-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border: 3rpx solid $pixel-ink;
  background: $pixel-card-alt;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: $pixel-ink;
  flex-shrink: 0;
}

.apply-name,
.friend-name,
.feed-title {
  font-size: 26rpx;
  font-weight: 700;
  color: $pixel-ink;
}

.apply-ops,
.user-ops {
  display: flex;
  gap: 12rpx;
  margin-left: auto;
}

.add-row,
.found-row {
  display: flex;
  gap: 12rpx;
  align-items: center;

  .add-input {
    flex: 1;
  }

  .found-name {
    font-size: 26rpx;
    color: $pixel-ink;
  }
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;

  .friend-streak {
    font-size: 22rpx;
    color: $pixel-ink-light;
  }
}

.feed-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;

  .feed-sub {
    font-size: 22rpx;
    color: $pixel-ink-light;
  }
}

.like-btn.liked {
  opacity: 0.6;
}

.empty-line {
  font-size: 24rpx;
  color: $pixel-ink-light;
  text-align: center;
  padding: 12rpx 0;
}
</style>
