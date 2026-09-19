<template>
  <view class="login-page">
    <!-- 顶部 LOGO -->
    <view class="logo-area">
      <image class="pixelated logo-cat" src="/static/pixel/cat-orange-idle.png" mode="aspectFit" />
      <text class="app-name">{{ APP_NAME }}</text>
      <text class="app-slogan">打卡喂猫 · 习惯死斗</text>
    </view>

    <!-- 模式切换 -->
    <view class="mode-switch">
      <view class="mode-item" :class="{ active: mode === 'login' }" @tap="switchMode('login')">登 录</view>
      <view class="mode-item" :class="{ active: mode === 'register' }" @tap="switchMode('register')">注 册</view>
    </view>

    <!-- 表单 -->
    <view class="form-card pixel-card">
      <view v-if="errorMsg" class="form-error">⚠ {{ errorMsg }}</view>
      <view class="form-item">
        <text class="form-label">账号</text>
        <input
          v-model="userAccount"
          class="pixel-input"
          :class="{ 'has-err': errField === 'account' }"
          placeholder="4~32 位账号"
          @input="clearError"
          placeholder-class="pixel-placeholder"
          :maxlength="32"
        />
      </view>
      <view class="form-item">
        <text class="form-label">密码</text>
        <input
          v-model="userPassword"
          class="pixel-input"
          type="password"
          :class="{ 'has-err': errField === 'password' }"
          placeholder="至少 8 位密码"
          @input="clearError"
          placeholder-class="pixel-placeholder"
          :maxlength="32"
        />
      </view>
      <view v-if="mode === 'register'" class="form-item">
        <text class="form-label">确认密码</text>
        <input
          v-model="checkPassword"
          class="pixel-input"
          type="password"
          :class="{ 'has-err': errField === 'check' }"
          placeholder="再输入一次密码"
          @input="clearError"
          placeholder-class="pixel-placeholder"
          :maxlength="32"
        />
      </view>

      <button class="pixel-btn submit-btn" :loading="submitting" @tap="handleSubmit">
        {{ mode === 'login' ? '进 入' : '注 册 并 登 录' }}
      </button>
    </view>

    <text class="foot-tip">注册即送 1000 喵币，快来领养你的猫精灵！</text>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { APP_NAME } from '@/config'
import { storage } from '@/utils/storage'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const mode = ref<'login' | 'register'>('login')
const userAccount = ref('')
const userPassword = ref('')
const checkPassword = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const errField = ref('')

function clearError() {
  errorMsg.value = ''
  errField.value = ''
}

onShow(() => {
  // 已登录直接进首页
  if (userStore.isLoggedIn) {
    uni.switchTab({ url: '/pages/index/index' })
  }
})

function switchMode(m: 'login' | 'register') {
  mode.value = m
}

function validate(): string | null {
  clearError()
  if (userAccount.value.trim().length < 4) {
    errField.value = 'account'
    return '账号至少 4 位'
  }
  if (userPassword.value.length < 8) {
    errField.value = 'password'
    return '密码至少 8 位'
  }
  if (mode.value === 'register' && checkPassword.value !== userPassword.value) {
    errField.value = 'check'
    return '两次密码不一致'
  }
  return null
}

async function handleSubmit() {
  if (submitting.value) return
  const err = validate()
  if (err) {
    errorMsg.value = err
    return
  }
  submitting.value = true
  try {
    if (mode.value === 'register') {
      await userStore.register(userAccount.value.trim(), userPassword.value, checkPassword.value)
      uni.showToast({ title: '注册成功', icon: 'success' })
    }
    await userStore.login(userAccount.value.trim(), userPassword.value)
    const pendingCode = storage.get<string>('pendingInviteCode')
    if (pendingCode) {
      storage.remove('pendingInviteCode')
      uni.reLaunch({ url: `/pages/duel/join?code=${pendingCode}` })
      return
    }
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (e: any) {
    // 后端错误（账号已存在/账号或密码错误等）在表单内常驻展示
    errorMsg.value = e?.message || '操作失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  padding: 100rpx 48rpx 60rpx;
  display: flex;
  flex-direction: column;
  background:
    repeating-linear-gradient(0deg, transparent 0 38rpx, rgba(74, 55, 40, 0.04) 38rpx 40rpx),
    repeating-linear-gradient(90deg, transparent 0 38rpx, rgba(74, 55, 40, 0.04) 38rpx 40rpx),
    $pixel-bg;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 64rpx;

  .logo-cat {
    width: 192rpx;
    height: 192rpx;
  }

  .app-name {
    margin-top: 16rpx;
    font-size: 56rpx;
    font-weight: 900;
    letter-spacing: 8rpx;
    color: $pixel-ink;
    text-shadow: 4rpx 4rpx 0 $pixel-yellow;
  }

  .app-slogan {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: $pixel-ink-light;
    letter-spacing: 4rpx;
  }
}

.mode-switch {
  display: flex;
  margin-bottom: -4rpx;
  position: relative;
  z-index: 1;
  padding: 0 24rpx;

  .mode-item {
    @include pixel-btn($pixel-card-alt, $pixel-ink-light);
    height: 72rpx;
    flex: 1;
    font-size: 28rpx;
    box-shadow: none;

    &.active {
      background: $pixel-yellow;
      color: $pixel-ink;
    }
  }
}

.form-card {
  position: relative;
  z-index: 0;
}

.form-item {
  margin-bottom: 28rpx;

  &:last-of-type {
    margin-bottom: 40rpx;
  }

  .form-label {
    display: block;
    font-size: 24rpx;
    font-weight: 800;
    color: $pixel-ink;
    margin-bottom: 10rpx;
  }

  .pixel-input {
    @include pixel-block;
    height: 84rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    font-weight: 700;
    color: $pixel-ink;
    width: 100%;
    box-sizing: border-box;

    &.has-err {
      border-color: $pixel-red;
      background: #fdeeee;
    }
  }

  .form-error {
    @include pixel-block($pixel-red);
    color: #fff;
    font-size: 24rpx;
    font-weight: 700;
    padding: 14rpx 20rpx;
    margin-bottom: 24rpx;
  }
}

.pixel-placeholder {
  color: $uni-text-color-placeholder;
}

.submit-btn {
  width: 100%;
}

.foot-tip {
  margin-top: auto;
  padding-top: 48rpx;
  text-align: center;
  font-size: 22rpx;
  color: $pixel-ink-light;
}
</style>
