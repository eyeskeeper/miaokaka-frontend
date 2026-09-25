<template>
  <view class="page">
    <!-- 页签 -->
    <view class="tab-row pixel-card">
      <text class="tab-chip" :class="{ active: tab === 'users' }" @tap="tab = 'users'">👤 用户管理</text>
      <text class="tab-chip" :class="{ active: tab === 'dash' }" @tap="switchDash">📊 数据看板</text>
    </view>

    <!-- 搜索 / 角色筛选 -->
    <view v-show="showUsers" class="toolbar pixel-card">
      <input
        v-model="keyword"
        class="pixel-input search-input"
        :maxlength="32"
        placeholder="昵称搜索"
        placeholder-class="pixel-placeholder"
        confirm-type="search"
        @confirm="search"
      />
      <view class="seg">
        <button class="pixel-btn-sm" :class="{ 'seg-active': roleFilter === '' }" @tap="setRoleFilter('')">全部</button>
        <button class="pixel-btn-sm" :class="{ 'seg-active': roleFilter === 'user' }" @tap="setRoleFilter('user')">普通</button>
        <button class="pixel-btn-sm" :class="{ 'seg-active': roleFilter === 'admin' }" @tap="setRoleFilter('admin')">管理员</button>
      </view>
    </view>

    <!-- 用户列表 -->
    <view v-show="showUsers" class="list pixel-card">
      <view v-for="u in list" :key="u.id" class="user-row">
        <view class="user-main">
          <view class="user-line">
            <text class="user-name">{{ u.userName || u.userAccount }}</text>
            <text class="pixel-tag role-tag" :class="roleClass(u.userRole)">{{ roleText(u.userRole) }}</text>
          </view>
          <text class="user-sub">
            {{ u.userAccount }} · 连击 {{ u.currentStreak }} · 积分 {{ u.totalPoints }} · {{ fmtTime(u.createTime) }}
          </text>
        </view>
        <view class="user-ops">
          <button class="pixel-btn-sm" @tap="openEdit(u)">编辑</button>
          <button class="pixel-btn-sm" @tap="toggleBan(u)">{{ u.userRole === 'ban' ? '解封' : '封禁' }}</button>
          <button class="pixel-btn-sm-red" @tap="doDelete(u)">删除</button>
        </view>
      </view>
      <text v-if="!loading && list.length === 0" class="empty">暂无用户</text>
    </view>

    <!-- 分页 -->
    <view v-show="showUsers" class="pager pixel-card">
      <button class="pixel-btn-sm" :disabled="current <= 1" @tap="prev">上一页</button>
      <text class="pager-info">{{ current }} / {{ totalPages }} 页 · 共 {{ total }} 人</text>
      <button class="pixel-btn-sm" :disabled="current >= totalPages" @tap="next">下一页</button>
    </view>

    <button v-show="showUsers" class="pixel-btn-green fab" :loading="false" @tap="openCreate">＋ 新建用户</button>

    <!-- 数据看板 -->
    <view v-if="showDash" class="dash">
      <!-- 公告发布 -->
      <view class="pixel-card section">
        <text class="pixel-h2">📣 发布公告</text>
        <text class="dash-tip">发布后广播到每个用户的通知中心</text>
        <input
          v-model="annForm.title"
          class="pixel-input"
          :maxlength="64"
          placeholder="公告标题"
          placeholder-class="pixel-placeholder"
        />
        <textarea
          v-model="annForm.content"
          class="pixel-input ann-textarea"
          :maxlength="512"
          placeholder="公告内容"
          placeholder-class="pixel-placeholder"
        />
        <button class="pixel-btn-green" :loading="annLoading" @tap="doAnnounce">📢 广播公告</button>
      </view>

      <!-- 公告历史 -->
      <view class="pixel-card section">
        <view class="flex-between">
          <text class="pixel-h2">📜 公告历史</text>
          <button class="pixel-btn-sm" @tap="loadAnnouncements">刷新</button>
        </view>
        <view v-for="a in announcements" :key="a.id" class="ann-row">
          <text class="ann-title">{{ a.title }}</text>
          <text class="ann-content">{{ a.content }}</text>
          <text class="ann-meta">by {{ a.creatorName }} · {{ fmtTime(a.createTime) }}</text>
        </view>
        <text v-if="announcements.length === 0" class="empty">还没有发过公告</text>
      </view>

      <!-- 数据看板 -->
      <view class="pixel-card section">
        <view class="flex-between">
          <text class="pixel-h2">📊 数据看板</text>
          <button class="pixel-btn-sm" :loading="statsLoading" @tap="loadStats">刷新</button>
        </view>
        <template v-if="stats">
          <view class="metric-grid">
            <view class="metric"><text class="metric-num">{{ stats.totalUsers }}</text><text class="metric-label">累计用户</text></view>
            <view class="metric"><text class="metric-num">{{ stats.todayNewUsers }}</text><text class="metric-label">今日新增</text></view>
            <view class="metric"><text class="metric-num">{{ stats.dauToday }}</text><text class="metric-label">今日 DAU</text></view>
            <view class="metric"><text class="metric-num">{{ stats.dauYesterday }}</text><text class="metric-label">昨日 DAU</text></view>
            <view class="metric"><text class="metric-num">{{ stats.checkinsToday }}</text><text class="metric-label">今日打卡</text></view>
            <view class="metric"><text class="metric-num">{{ stats.checkinsYesterday }}</text><text class="metric-label">昨日打卡</text></view>
            <view class="metric"><text class="metric-num">{{ stats.checkinsWeek }}</text><text class="metric-label">本周打卡</text></view>
            <view class="metric"><text class="metric-num">{{ stats.checkinsTotal }}</text><text class="metric-label">累计打卡</text></view>
            <view class="metric"><text class="metric-num">{{ stats.duelsRecruiting }}</text><text class="metric-label">招募中局数</text></view>
            <view class="metric"><text class="metric-num">{{ stats.duelsRunning }}</text><text class="metric-label">进行中局数</text></view>
            <view class="metric"><text class="metric-num">{{ stats.duelsSettled }}</text><text class="metric-label">已结算局数</text></view>
          </view>
          <text class="sub-title">近 7 天打卡趋势</text>
          <view class="week-bars">
            <view v-for="d in stats.trend7" :key="d.date" class="day-col">
              <view class="bar-wrap">
                <view class="bar" :style="{ height: trendBar(d.count) + 'rpx' }" />
              </view>
              <text class="day-num">{{ d.count }}</text>
              <text class="day-label">{{ d.date.slice(5) }}</text>
            </view>
          </view>
        </template>
      </view>
    </view>

    <!-- 新建弹窗 -->
    <view v-if="createVisible" class="modal-mask" @tap="createVisible = false">
      <view class="modal pixel-card" @tap.stop>
        <text class="pixel-h2">新建用户（赠 1000 喵币）</text>
        <input
          v-model="createForm.userAccount"
          class="pixel-input modal-input"
          :maxlength="32"
          placeholder="账号（4~32 位）"
          placeholder-class="pixel-placeholder"
        />
        <input
          v-model="createForm.initialPassword"
          class="pixel-input modal-input"
          :password="true"
          :maxlength="32"
          placeholder="初始密码（8~32 位）"
          placeholder-class="pixel-placeholder"
        />
        <input
          v-model="createForm.userName"
          class="pixel-input modal-input"
          :maxlength="32"
          placeholder="昵称（可选，默认随机喵友号）"
          placeholder-class="pixel-placeholder"
        />
        <view class="modal-btns">
          <button class="pixel-btn-sm" @tap="createVisible = false">取消</button>
          <button class="pixel-btn-sm-green" :loading="creating" @tap="doCreate">创建</button>
        </view>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="editVisible" class="modal-mask" @tap="editVisible = false">
      <view class="modal pixel-card" @tap.stop>
        <text class="pixel-h2">编辑 · {{ editTarget?.userAccount }}</text>
        <input
          v-model="editForm.userName"
          class="pixel-input modal-input"
          :maxlength="32"
          placeholder="昵称"
          placeholder-class="pixel-placeholder"
        />
        <input
          v-model="editForm.userAvatar"
          class="pixel-input modal-input"
          :maxlength="300"
          placeholder="头像 URL"
          placeholder-class="pixel-placeholder"
        />
        <button class="pixel-btn-sm upload-btn" :loading="uploading" @tap="chooseAvatar">上传头像</button>
        <view class="seg">
          <button class="pixel-btn-sm" :class="{ 'seg-active': editForm.userRole === 'user' }" @tap="editForm.userRole = 'user'">
            普通用户
          </button>
          <button class="pixel-btn-sm" :class="{ 'seg-active': editForm.userRole === 'admin' }" @tap="editForm.userRole = 'admin'">
            管理员
          </button>
        </view>
        <input
          v-model="editForm.newPassword"
          class="pixel-input modal-input"
          :password="true"
          :maxlength="32"
          placeholder="重置密码（留空不修改，8~32 位）"
          placeholder-class="pixel-placeholder"
        />
        <view class="modal-btns">
          <button class="pixel-btn-sm" @tap="editVisible = false">取消</button>
          <button class="pixel-btn-sm-green" :loading="saving" @tap="doSave">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  banAdminUser,
  createAdminUser,
  createAnnouncement,
  deleteAdminUser,
  getAdminStats,
  getAnnouncements,
  pageAdminUsers,
  updateAdminUser
} from '@/api/admin'
import { useUserStore } from '@/stores/user'
import type { AdminStatsVO, AdminUserVO, AnnouncementVO } from '@/types/api'
import { uploadImage } from '@/utils/upload'

const userStore = useUserStore()

const isAdmin = computed(() => userStore.userInfo?.userRole === 'admin')

/** users=用户管理 dash=数据看板 */
const tab = ref<'users' | 'dash'>('users')

const showUsers = computed(() => tab.value === 'users')
const showDash = computed(() => tab.value === 'dash')

const stats = ref<AdminStatsVO | null>(null)
const statsLoading = ref(false)

const announcements = ref<AnnouncementVO[]>([])
const annLoading = ref(false)
const annForm = reactive({ title: '', content: '' })

function switchDash() {
  tab.value = 'dash'
  if (!stats.value) loadStats()
  loadAnnouncements()
}

function loadStats() {
  statsLoading.value = true
  getAdminStats()
    .then((d) => (stats.value = d))
    .catch(() => {})
    .finally(() => (statsLoading.value = false))
}

function loadAnnouncements() {
  annLoading.value = true
  getAnnouncements(1, 20)
    .then((d) => (announcements.value = d.records))
    .catch(() => {})
    .finally(() => (annLoading.value = false))
}

async function doAnnounce() {
  if (annLoading.value) return
  if (!annForm.title.trim() || !annForm.content.trim()) {
    uni.showToast({ title: '标题与内容不能为空', icon: 'none' })
    return
  }
  annLoading.value = true
  try {
    const r = await createAnnouncement({
      title: annForm.title.trim(),
      content: annForm.content.trim()
    })
    uni.showToast({ title: `已广播给 ${r.delivered} 位用户`, icon: 'none' })
    annForm.title = ''
    annForm.content = ''
    loadAnnouncements()
  } catch {
    // 统一提示
  } finally {
    annLoading.value = false
  }
}

function trendBar(count: number) {
  const max = Math.max(...(stats.value?.trend7 ?? []).map((t) => t.count), 1)
  return Math.max(10, Math.round((count / max) * 120))
}

const PAGE_SIZE = 10
const list = ref<AdminUserVO[]>([])
const current = ref(1)
const total = ref(0)
const totalPages = ref(1)
const keyword = ref('')
const roleFilter = ref<'' | 'user' | 'admin'>('')
const loading = ref(false)

onLoad(() => {
  if (!isAdmin.value) {
    uni.showToast({ title: '仅管理员可访问', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 600)
    return
  }
  fetchPage(1)
})

async function fetchPage(page: number) {
  if (loading.value) return
  loading.value = true
  try {
    const data = await pageAdminUsers({
      current: page,
      pageSize: PAGE_SIZE,
      userName: keyword.value.trim() || undefined,
      userRole: roleFilter.value || undefined
    })
    list.value = data.records
    total.value = data.total
    current.value = data.current
    totalPages.value = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
  } finally {
    loading.value = false
  }
}

function search() {
  fetchPage(1)
}

function setRoleFilter(role: '' | 'user' | 'admin') {
  roleFilter.value = role
  fetchPage(1)
}

function prev() {
  if (current.value > 1) fetchPage(current.value - 1)
}

function next() {
  if (current.value < totalPages.value) fetchPage(current.value + 1)
}

// ===== 新建 =====

const createVisible = ref(false)
const creating = ref(false)
const createForm = reactive({ userAccount: '', initialPassword: '', userName: '' })

function openCreate() {
  createForm.userAccount = ''
  createForm.initialPassword = ''
  createForm.userName = ''
  createVisible.value = true
}

async function doCreate() {
  const account = createForm.userAccount.trim()
  if (account.length < 4 || account.length > 32) {
    toast('账号长度需在 4~32 位之间')
    return
  }
  if (createForm.initialPassword.length < 8 || createForm.initialPassword.length > 32) {
    toast('密码长度需在 8~32 位之间')
    return
  }
  creating.value = true
  try {
    await createAdminUser({
      userAccount: account,
      initialPassword: createForm.initialPassword,
      userName: createForm.userName.trim() || undefined
    })
    createVisible.value = false
    toast('已创建')
    fetchPage(1)
  } finally {
    creating.value = false
  }
}

// ===== 编辑 =====

const editVisible = ref(false)
const saving = ref(false)
const uploading = ref(false)
const editTarget = ref<AdminUserVO | null>(null)
const editForm = reactive({ userName: '', userAvatar: '', userRole: 'user', newPassword: '' })

function openEdit(u: AdminUserVO) {
  editTarget.value = u
  editForm.userName = u.userName || ''
  editForm.userAvatar = u.userAvatar || ''
  editForm.userRole = u.userRole === 'admin' ? 'admin' : 'user'
  editForm.newPassword = ''
  editVisible.value = true
}

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const filePath = res.tempFilePaths?.[0]
      if (!filePath) return
      uploading.value = true
      uploadImage(filePath)
        .then(({ url }) => {
          editForm.userAvatar = url
          toast('头像已上传')
        })
        .catch(() => {})
        .finally(() => {
          uploading.value = false
        })
    }
  })
}

async function doSave() {
  if (!editTarget.value) return
  if (!editForm.userName.trim()) {
    toast('昵称不能为空')
    return
  }
  if (editForm.newPassword && (editForm.newPassword.length < 8 || editForm.newPassword.length > 32)) {
    toast('密码长度需在 8~32 位之间')
    return
  }
  saving.value = true
  try {
    await updateAdminUser(editTarget.value.id, {
      userName: editForm.userName.trim(),
      userAvatar: editForm.userAvatar.trim() || undefined,
      userRole: editForm.userRole,
      newPassword: editForm.newPassword || undefined
    })
    editVisible.value = false
    toast('已保存')
    fetchPage(current.value)
  } finally {
    saving.value = false
  }
}

// ===== 封禁 / 删除 =====

async function toggleBan(u: AdminUserVO) {
  const banning = u.userRole !== 'ban'
  const ok = await confirm(
    banning
      ? `封禁「${u.userName || u.userAccount}」？其登录态立即失效`
      : `解封「${u.userName || u.userAccount}」？`
  )
  if (!ok) return
  await banAdminUser({ userId: u.id, isBan: banning })
  toast(banning ? '已封禁' : '已解封')
  fetchPage(current.value)
}

async function doDelete(u: AdminUserVO) {
  const ok = await confirm(`删除「${u.userName || u.userAccount}」？账号将归档，原账号名可重新注册`)
  if (!ok) return
  await deleteAdminUser(u.id)
  toast('已删除')
  fetchPage(current.value)
}

// ===== 工具 =====

function confirm(content: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({ title: '确认操作', content, success: (r) => resolve(!!r.confirm) })
  })
}

function toast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

function roleText(role: string) {
  return role === 'admin' ? '管理员' : role === 'ban' ? '已封禁' : '普通用户'
}

function roleClass(role: string) {
  return role === 'admin' ? 'role-admin' : role === 'ban' ? 'role-ban' : 'role-user'
}

function fmtTime(value: string) {
  return (value || '').slice(0, 10)
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 140rpx;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .search-input {
    width: 100%;
  }
}

.seg {
  display: flex;
  gap: 12rpx;

  .seg-active {
    background: $pixel-primary;
    color: #fffbef;
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx dashed $pixel-ink-light;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.user-main {
  flex: 1;
  min-width: 0;
}

.user-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-name {
  font-weight: 700;
  font-size: 28rpx;
  color: $pixel-ink;
}

.role-tag.role-admin {
  background: $pixel-primary;
  color: #fffbef;
}

.role-tag.role-ban {
  background: $pixel-red;
  color: #fffbef;
}

.user-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $pixel-ink-light;
}

.user-ops {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.empty {
  text-align: center;
  color: $pixel-ink-light;
  font-size: 26rpx;
  padding: 24rpx 0;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .pager-info {
    font-size: 24rpx;
    color: $pixel-ink-light;
  }
}

.fab {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 40rpx;
}

.modal-input {
  margin-top: 20rpx;
}

.upload-btn {
  margin-top: 16rpx;
}

.tab-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 4rpx;

  .tab-chip {
    flex: 1;
    text-align: center;
    padding: 14rpx 0;
    font-size: 26rpx;
    border: 3rpx solid $pixel-ink;
    background: $pixel-card-alt;
    color: $pixel-ink;
    font-weight: 700;

    &.active {
      background: $pixel-primary;
      color: #fffbef;
    }
  }
}

.dash {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-bottom: 40rpx;
}

.dash-tip {
  font-size: 22rpx;
  color: $pixel-ink-light;
}

.ann-textarea {
  width: 100%;
  height: 140rpx;
  padding: 16rpx;
  box-sizing: border-box;
  font-size: 26rpx;
}

.ann-row {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding-bottom: 14rpx;
  border-bottom: 2rpx dashed $pixel-ink-light;

  .ann-title {
    font-size: 26rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  .ann-content {
    font-size: 24rpx;
    color: $pixel-ink;
  }

  .ann-meta {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}

.metric-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.metric {
  width: calc(33.3% - 12rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
  background: $pixel-card-alt;
  border: 2rpx solid $pixel-ink;

  .metric-num {
    font-size: 34rpx;
    font-weight: 700;
    color: $pixel-primary;
  }

  .metric-label {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}

.sub-title {
  font-size: 24rpx;
  font-weight: 700;
  color: $pixel-ink;
}

.week-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.day-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;

  .bar-wrap {
    height: 130rpx;
    display: flex;
    align-items: flex-end;
  }

  .bar {
    width: 40rpx;
    background: $pixel-green;
    border: 3rpx solid $pixel-ink;
  }

  .day-num {
    font-size: 22rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  .day-label {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}
</style>
