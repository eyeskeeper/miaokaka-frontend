<template>
  <view class="login-container">
    <!-- Logo区域 -->
    <view class="logo-section">
      <u-image src="/static/logo.png" mode="aspectFit" width="120" height="120" class="logo"></u-image>
      <text class="app-title">每日打卡</text>
      <text class="app-subtitle">和你的猫咪一起养成好习惯</text>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <u-form :model="formData" ref="uForm">
        <u-form-item prop="phone">
          <u-input
            v-model="formData.phone"
            placeholder="请输入手机号"
            prefix-icon="phone"
            clearable
          ></u-input>
        </u-form-item>
        <u-form-item prop="password">
          <u-input
            v-model="formData.password"
            placeholder="请输入密码"
            prefix-icon="lock"
            type="password"
            clearable
          ></u-input>
        </u-form-item>
      </u-form>

      <u-button type="primary" @click="handleLogin" :loading="loading" shape="circle">
        登录
      </u-button>

      <u-divider>或</u-divider>

      <u-button
        type="info"
        @click="handleWechatLogin"
        shape="circle"
        open-type="getUserInfo"
        @getuserinfo="handleWechatUserInfo"
      >
        微信一键登录
      </u-button>
    </view>

    <!-- 用户协议 -->
    <view class="agreement">
      <u-checkbox v-model="agreement"></u-checkbox>
      <text class="agreement-text">我已阅读并同意</text>
      <text class="agreement-link">《用户协议》</text>
      <text class="agreement-text">和</text>
      <text class="agreement-link">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { storage } from '@/utils/storage'

const userStore = useUserStore()

const loading = ref(false)
const agreement = ref(false)
const uForm = ref(null)

const formData = reactive({
  phone: '',
  password: ''
})

// 表单验证规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 手机号登录
const handleLogin = async () => {
  if (!agreement.value) {
    uni.showToast({
      title: '请先同意用户协议',
      icon: 'none'
    })
    return
  }

  loading.value = true

  try {
    // 表单验证
    // @ts-ignore
    await uForm.value.validate()

    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 登录成功
    userStore.setUserInfo({
      userId: '1',
      nickname: '喵星人',
      avatar: '',
      phone: formData.phone,
      isLoggedIn: true,
      token: 'mock_token'
    })

    // 保存到本地存储
    storage.set('userInfo', userStore.$state)

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)

  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 微信登录
const handleWechatLogin = () => {
  uni.getUserProfile({
    desc: '用于完善会员资料',
    success: (res) => {
      handleWechatUserInfo(res)
    },
    fail: (err) => {
      console.log('用户拒绝授权:', err)
    }
  })
}

// 微信用户信息回调
const handleWechatUserInfo = (res: any) => {
  if (!agreement.value) {
    uni.showToast({
      title: '请先同意用户协议',
      icon: 'none'
    })
    return
  }

  loading.value = true

  try {
    // 模拟微信登录
    setTimeout(() => {
      userStore.setUserInfo({
        userId: 'wx_' + Date.now(),
        nickname: res.userInfo?.nickName || '微信用户',
        avatar: res.userInfo?.avatarUrl || '',
        phone: '',
        isLoggedIn: true,
        token: 'wx_mock_token'
      })

      storage.set('userInfo', userStore.$state)

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    }, 1000)

  } catch (error) {
    console.error('微信登录失败:', error)
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #CDDC39 0%, #8BC34A 100%);
  padding: 60rpx 40rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 100rpx;

  .logo {
    margin-bottom: 30rpx;
  }

  .app-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
  }

  .app-subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.form-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.u-button {
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.u-divider {
  margin: 30rpx 0;
}

.agreement {
  text-align: center;
  margin-top: 40rpx;
  color: #666;

  .agreement-text {
    font-size: 24rpx;
  }

  .agreement-link {
    color: #AED581;
    text-decoration: underline;
  }
}
</style>