<template>
  <view class="page">
    <!-- 搜索 / 角色筛选 -->
    <view class="toolbar pixel-card">
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
    <view class="list pixel-card">
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
    <view class="pager pixel-card">
      <button class="pixel-btn-sm" :disabled="current <= 1" @tap="prev">上一页</button>
      <text class="pager-info">{{ current }} / {{ totalPages }} 页 · 共 {{ total }} 人</text>
      <button class="pixel-btn-sm" :disabled="current >= totalPages" @tap="next">下一页</button>
    </view>

    <button class="pixel-btn-green fab" :loading="false" @tap="openCreate">＋ 新建用户</button>

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
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  banAdminUser,
  createAdminUser,
  deleteAdminUser,
  pageAdminUsers,
  updateAdminUser
} from '@/api/admin'
import { useUserStore } from '@/stores/user'
import type { AdminUserVO } from '@/types/api'
import { uploadImage } from '@/utils/upload'

const userStore = useUserStore()

const isAdmin = computed(() => userStore.userInfo?.userRole === 'admin')

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
</style>
