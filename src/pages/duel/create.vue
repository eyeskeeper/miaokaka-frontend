<template>
  <view class="create-duel">
    <!-- AI 生成入口 -->
    <view class="ai-card pixel-card">
      <view class="ai-head">
        <text class="pixel-h2">🤖 AI 帮我想</text>
        <text class="ai-tip">一句话描述，生成死斗名称与每日任务</text>
      </view>
      <view class="ai-row">
        <input
          v-model="aiDescription"
          class="ai-input"
          placeholder="例如：和好友死磕 21 天早起背单词"
          placeholder-class="pixel-placeholder"
          :maxlength="500"
        />
        <button class="pixel-btn-sm" :loading="aiLoading" @tap="genDraft">生成</button>
      </view>
    </view>

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
        <text class="form-label">每日任务（最多 5 项，可选）</text>
        <view class="task-list">
          <view v-for="(task, i) in tasks" :key="i" class="task-row">
            <input
              v-model="tasks[i]"
              class="pixel-input task-input"
              placeholder="任务内容，如：背 50 个单词"
              placeholder-class="pixel-placeholder"
              :maxlength="50"
            />
            <view class="task-del" @tap="removeTask(i)">✕</view>
          </view>
        </view>
        <view v-if="tasks.length < 5" class="task-add" @tap="addTask">＋ 加一项任务</view>
        <text class="field-tip">成员每天需勾选任务并上传照片凭证，组长审核通过才算打卡</text>
      </view>

      <view class="form-item">
        <text class="form-label">加入方式 *</text>
        <view class="mode-row">
          <view class="mode-chip" :class="{ active: form.joinMode === 0 }" @tap="form.joinMode = 0">
            <text class="mode-icon">🚪</text>
            <view class="mode-info">
              <text class="mode-name">直接加入</text>
              <text class="mode-desc">扫码/搜组号即入</text>
            </view>
          </view>
          <view class="mode-chip" :class="{ active: form.joinMode === 1 }" @tap="form.joinMode = 1">
            <text class="mode-icon">🛡</text>
            <view class="mode-info">
              <text class="mode-name">需组长审核</text>
              <text class="mode-desc">同意申请后才入组</text>
            </view>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">人数上限（2~50 人）*</text>
        <view class="deposit-row">
          <button class="pixel-btn-sm step-btn" @tap="stepMaxMembers(-1)">－</button>
          <input v-model="maxMembersText" class="pixel-input dep-input" type="number" :maxlength="2" />
          <button class="pixel-btn-sm-green step-btn" @tap="stepMaxMembers(1)">＋</button>
        </view>
        <text class="field-tip">满员后无法再加入，招满即止</text>
      </view>

      <view class="form-item">
        <view class="hide-row" @tap="form.hidden = !form.hidden">
          <view class="hide-info">
            <text class="form-label">🔒 隐藏死斗</text>
            <text class="hide-desc">不进招募大厅，仅可通过组号/邀请海报发现</text>
          </view>
          <view class="hide-switch" :class="{ on: form.hidden }">
            <view class="switch-knob" />
          </view>
        </view>
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
        <text class="form-label">开始日期（最早明天）</text>
        <picker mode="date" :value="form.startDate" :start="tomorrowStr" @change="onDateChange">
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
import { getPlanDraft } from '@/api/ai'
import { useDuelStore } from '@/stores/duel'
import type { AiPlanDraftVO } from '@/types/api'

const duelStore = useDuelStore()

const form = reactive({
  duelName: '',
  duelDesc: '',
  startDate: '',
  joinMode: 0,
  hidden: false
})

/** 每日任务清单（≤5 项，空串在提交时过滤） */
const tasks = ref<string[]>([])

const aiDescription = ref('')
const aiLoading = ref(false)

onShow(() => {
  if (!ensureLogin()) return
})

const depositText = ref('100')
const daysText = ref('21')
const maxMembersText = ref('10')
const submitting = ref(false)

const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const deposit = computed(() => Math.max(0, Number(depositText.value) || 0))
const maxMembers = computed(() => Math.max(0, Number(maxMembersText.value) || 0))

function stepMaxMembers(delta: number) {
  const next = Math.min(50, Math.max(2, maxMembers.value + delta))
  maxMembersText.value = String(next)
}

function addTask() {
  if (tasks.value.length < 5) tasks.value.push('')
}

function removeTask(i: number) {
  tasks.value.splice(i, 1)
}

async function genDraft() {
  if (!aiDescription.value.trim()) {
    uni.showToast({ title: '先描述一下想死磕的习惯', icon: 'none' })
    return
  }
  aiLoading.value = true
  try {
    const draft: AiPlanDraftVO = await getPlanDraft(aiDescription.value.trim())
    form.duelName = draft.planName ? `${draft.planName}死斗` : form.duelName
    form.duelDesc = draft.planDesc || form.duelDesc
    if (draft.targetDays && draft.targetDays >= 3) {
      daysText.value = String(Math.min(365, draft.targetDays))
    }
    const draftTasks = (draft.dailyTasks || []).slice(0, 5)
    if (draftTasks.length) tasks.value = draftTasks
    uni.showToast({ title: '草稿已填入，可继续修改', icon: 'none' })
  } catch {
    // AI 不可用时统一报错，用户可手填
  } finally {
    aiLoading.value = false
  }
}

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
  const maxMembersNum = Number(maxMembersText.value) || 0
  const dailyTasks = tasks.value.map((t) => t.trim()).filter(Boolean)
  if (!name) {
    uni.showToast({ title: '给死斗起个名字', icon: 'none' })
    return
  }
  if (dailyTasks.length > 5) {
    uni.showToast({ title: '每日任务最多 5 项', icon: 'none' })
    return
  }
  if (maxMembersNum < 2 || maxMembersNum > 50) {
    uni.showToast({ title: '人数上限须在 2~50 之间', icon: 'none' })
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
      dailyTasks: dailyTasks.length ? dailyTasks : undefined,
      maxMembers: maxMembersNum,
      hidden: form.hidden || undefined,
      joinMode: form.joinMode,
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
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.ai-card {
  .ai-head {
    display: flex;
    align-items: baseline;
    gap: 16rpx;
  }

  .ai-tip {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }

  .ai-row {
    display: flex;
    gap: 16rpx;
    margin-top: 18rpx;
    align-items: center;

    .ai-input {
      flex: 1;
      @include pixel-block;
      height: 72rpx;
      padding: 0 20rpx;
      font-size: 26rpx;
      font-weight: 700;
      color: $pixel-ink;
    }
  }
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

.task-list {
  .task-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;

    .task-input {
      flex: 1;
      height: 72rpx;
      font-size: 26rpx;
    }

    .task-del {
      @include pixel-block($pixel-card-alt);
      padding: 8rpx 16rpx;
      font-size: 24rpx;
      color: $pixel-red;
      font-weight: 900;
    }
  }
}

.task-add {
  display: inline-block;
  @include pixel-block;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  font-weight: 800;
  color: $pixel-green-dark;
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

.mode-row {
  display: flex;
  gap: 16rpx;

  .mode-chip {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12rpx;
    @include pixel-block;
    padding: 16rpx 18rpx;

    .mode-icon {
      font-size: 32rpx;
    }

    .mode-info {
      display: flex;
      flex-direction: column;
      gap: 4rpx;
      min-width: 0;
    }

    .mode-name {
      font-size: 26rpx;
      font-weight: 900;
      color: $pixel-ink;
    }

    .mode-desc {
      font-size: 18rpx;
      color: $pixel-ink-light;
    }

    &.active {
      background: $pixel-green;
      border-color: $pixel-ink;

      .mode-name {
        color: #fffbef;
      }

      .mode-desc {
        color: rgba(255, 251, 239, 0.8);
      }
    }
  }
}

.hide-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  @include pixel-block;
  padding: 16rpx 20rpx;

  .hide-info {
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .form-label {
      margin-bottom: 0;
    }
  }

  .hide-desc {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }

  .hide-switch {
    width: 84rpx;
    height: 44rpx;
    @include pixel-block($pixel-card-alt);
    position: relative;
    flex-shrink: 0;
    transition: background 0.15s;

    .switch-knob {
      position: absolute;
      top: 4rpx;
      left: 4rpx;
      width: 30rpx;
      height: 30rpx;
      background: $pixel-ink-light;
      transition: all 0.15s;
    }

    &.on {
      background: $pixel-green;

      .switch-knob {
        left: calc(100% - 34rpx);
        background: #fffbef;
      }
    }
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
