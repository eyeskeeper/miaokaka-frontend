<template>
  <view class="create-duel">
    <view class="form pixel-card">
      <view class="form-item">
        <text class="form-label">死斗名称 *</text>
        <input v-model="form.duelName" class="pixel-input" placeholder="例如：21天早起死斗" placeholder-class="pixel-placeholder" :maxlength="128" />
      </view>

      <view class="form-item">
        <text class="form-label">规则说明</text>
        <textarea v-model="form.duelDesc" class="pixel-textarea" placeholder="打卡内容、淘汰规则、奖池分配…" placeholder-class="pixel-placeholder" :maxlength="512" auto-height />
      </view>

      <view class="form-item">
        <text class="form-label">每人押金（100~5000 喵币）*</text>
        <view class="deposit-row">
          <button class="pixel-btn-sm step-btn" @tap="stepDeposit(-100)">－</button>
          <input v-model="depositText" class="pixel-input dep-input" type="number" :maxlength="5" />
          <button class="pixel-btn-sm-green step-btn" @tap="stepDeposit(100)">＋</button>
        </view>
        <text class="field-tip">退出仅限招募期，开始后押金不退，断卡即淘汰</text>
      </view>

      <view class="form-item">
        <text class="form-label">死斗天数（3~365 天）*</text>
        <input v-model="daysText" class="pixel-input" type="number" placeholder="例如 21" placeholder-class="pixel-placeholder" :maxlength="3" />
      </view>

      <view class="form-item">
        <text class="form-label">开始日期（默认明天）</text>
        <picker mode="date" :value="form.startDate" :start="todayStr" @change="onDateChange">
          <view class="pixel-input picker-text">{{ form.startDate || '明天开始' }}</view>
        </picker>
      </view>

      <view class="pool-preview pixel-block">
        <image class="pixelated" src="/static/pixel/icon-coin.png" />
        <text>当前已有 {{ deposit || 0 }} 喵币入池（1 人）· 每加 1 人翻 {{ deposit || 0 }}</text>
      </view>

      <button class="pixel-btn-red submit" :loading="submitting" @tap="submit">⚔️ 押喵币，开战！</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { createDuel } from '@/api/duel'
import { useDuelStore } from '@/stores/duel'

const duelStore = useDuelStore()

const form = reactive({
  duelName: '',
  duelDesc: '',
  startDate: ''
})

onShow(() => {
  if (!ensureLogin()) return
})

const depositText = ref('100')
const daysText = ref('21')
const submitting = ref(false)

const todayStr = new Date().toISOString().slice(0, 10)
const deposit = computed(() => Math.max(0, Number(depositText.value) || 0))

function stepDeposit(delta: number) {
  const next = Math.min(5000, Math.max(100, deposit.value + delta))
  depositText.value = String(next)
}

function onDateChange(e: any) {
  form.startDate = e.detail.value
}

async function submit() {
  if (submitting.value) return
  const name = form.duelName.trim()
  const dep = Number(depositText.value) || 0
  const days = Number(daysText.value) || 0
  if (!name) {
    uni.showToast({ title: '给死斗起个名字', icon: 'none' })
    return
  }
  if (dep < 100 || dep > 5000) {
    uni.showToast({ title: '押金须在 100~5000 之间', icon: 'none' })
    return
  }
  if (days < 3 || days > 365) {
    uni.showToast({ title: '天数须在 3~365 之间', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await createDuel({
      duelName: name,
      duelDesc: form.duelDesc.trim() || undefined,
      depositPerMember: dep,
      totalDays: days,
      startDate: form.startDate || undefined
    })
    uni.showToast({ title: '死斗已创立！', icon: 'success' })
    duelStore.fetchDuels(true)
    setTimeout(() => uni.navigateBack(), 800)
  } catch {
    // 余额不足等统一提示
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-duel {
  padding: 24rpx;
}

.form-item {
  margin-bottom: 32rpx;

  .form-label {
    display: block;
    font-size: 24rpx;
    font-weight: 800;
    color: $pixel-ink;
    margin-bottom: 12rpx;
  }

  .field-tip {
    display: block;
    margin-top: 10rpx;
    font-size: 20rpx;
    color: $pixel-red;
  }
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
}

.pixel-textarea {
  @include pixel-block;
  min-height: 140rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  color: $pixel-ink;
  width: 100%;
  box-sizing: border-box;
}

.pixel-placeholder {
  color: $uni-text-color-placeholder;
}

.picker-text {
  display: flex;
  align-items: center;
}

.deposit-row {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .dep-input {
    flex: 1;
    text-align: center;
  }
}

.pool-preview {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 22rpx;
  font-weight: 700;
  color: $pixel-primary-dark;
  margin-bottom: 32rpx;

  image {
    width: 32rpx;
    height: 32rpx;
  }
}

.submit {
  width: 100%;
  font-size: 32rpx;
}
</style>
