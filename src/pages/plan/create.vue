<template>
  <view class="create-page">
    <!-- AI 生成入口 -->
    <view v-if="!editId" class="ai-card pixel-card">
      <view class="ai-head">
        <text class="pixel-h2">🤖 AI 帮我想</text>
        <text class="ai-tip">一句话描述，自动生成计划草稿</text>
      </view>
      <view class="ai-row">
        <input
          v-model="aiDescription"
          class="ai-input"
          placeholder="例如：我想养成早睡读书的习惯"
          placeholder-class="pixel-placeholder"
          :maxlength="500"
        />
        <button class="pixel-btn-sm" :loading="aiLoading" @tap="genDraft">生成</button>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form pixel-card">
      <view class="form-item">
        <text class="form-label">计划名称 *</text>
        <input
          v-model="form.planName"
          class="pixel-input"
          placeholder="想坚持做什么？"
          placeholder-class="pixel-placeholder"
          :maxlength="128"
        />
      </view>

      <view class="form-item">
        <text class="form-label">类型</text>
        <view class="type-grid">
          <view
            v-for="t in PLAN_TYPES"
            :key="t.value"
            class="type-chip"
            :class="{ active: form.planType === t.value }"
            @tap="form.planType = t.value"
          >
            {{ t.icon }} {{ t.label }}
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">目标天数（0 = 不设限）</text>
        <input
          v-model="targetDaysText"
          class="pixel-input"
          type="number"
          placeholder="例如 21"
          placeholder-class="pixel-placeholder"
          :maxlength="4"
        />
      </view>

      <view class="form-item">
        <text class="form-label">每日任务（最多 5 项，勾满自动打卡）</text>
        <view class="task-list">
          <view v-for="(task, i) in tasks" :key="i" class="task-row">
            <input
              v-model="tasks[i]"
              class="pixel-input task-input"
              placeholder="任务内容"
              placeholder-class="pixel-placeholder"
              :maxlength="50"
            />
            <view class="task-del" @tap="removeTask(i)">✕</view>
          </view>
        </view>
        <view v-if="tasks.length < 5" class="task-add" @tap="addTask">＋ 加一项任务</view>
      </view>

      <view class="form-item">
        <text class="form-label">每日提醒（可选）</text>
        <picker mode="time" :value="form.remindTime" @change="onTimeChange">
          <view class="pixel-input picker-text">{{ form.remindTime || '不提醒' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">描述（可选）</text>
        <textarea
          v-model="form.planDesc"
          class="pixel-textarea"
          placeholder="记录一下你的决心"
          placeholder-class="pixel-placeholder"
          :maxlength="512"
          auto-height
        />
      </view>

      <button class="pixel-btn-green submit" :loading="submitting" @tap="submit">
        {{ editId ? '保存修改' : '创建计划，领养猫猫！' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { reactive, ref } from 'vue'
import { getPlanDraft } from '@/api/ai'
import { createPlan, getPlanDetail, updatePlan } from '@/api/plan'
import { PLAN_TYPES } from '@/constants/pixel'
import type { AiPlanDraftVO } from '@/types/api'

const form = reactive({
  planName: '',
  planDesc: '',
  planType: 0,
  remindTime: ''
})

const editId = ref(0)
const status = ref(0)
const targetDaysText = ref('')
const tasks = ref<string[]>([''])
const aiDescription = ref('')
const aiLoading = ref(false)
const submitting = ref(false)

onShow(() => {
  if (!ensureLogin()) return
})

onLoad(async (options) => {
  const id = Number(options?.id || 0)
  if (!id) return
  editId.value = id
  uni.setNavigationBarTitle({ title: '编辑计划' })
  try {
    const plan = await getPlanDetail(id)
    form.planName = plan.planName
    form.planDesc = plan.planDesc || ''
    form.planType = plan.planType
    form.remindTime = plan.remindTime || ''
    targetDaysText.value = plan.targetDays ? String(plan.targetDays) : ''
    tasks.value = (plan.dailyTasks || []).slice(0, 5)
    status.value = plan.status
    if (tasks.value.length === 0) tasks.value = ['']
  } catch {
    // 统一提示
  }
})

function addTask() {
  if (tasks.value.length < 5) tasks.value.push('')
}

function removeTask(i: number) {
  tasks.value.splice(i, 1)
}

function onTimeChange(e: any) {
  form.remindTime = e.detail.value
}

async function genDraft() {
  if (!aiDescription.value.trim()) {
    uni.showToast({ title: '先描述一下想养成的习惯', icon: 'none' })
    return
  }
  aiLoading.value = true
  try {
    const draft: AiPlanDraftVO = await getPlanDraft(aiDescription.value.trim())
    form.planName = draft.planName || form.planName
    form.planDesc = draft.planDesc || form.planDesc
    form.planType = draft.planType ?? 0
    targetDaysText.value = draft.targetDays ? String(draft.targetDays) : ''
    tasks.value = (draft.dailyTasks || []).slice(0, 5)
    if (tasks.value.length === 0) tasks.value = ['']
    uni.showToast({ title: '草稿已填入，可继续修改', icon: 'none' })
  } catch {
    // AI 不可用时统一报错，用户可手填
  } finally {
    aiLoading.value = false
  }
}

async function submit() {
  if (submitting.value) return
  const name = form.planName.trim()
  if (!name) {
    uni.showToast({ title: '给计划起个名字吧', icon: 'none' })
    return
  }
  const targetDays = Math.max(0, Math.min(3650, Number(targetDaysText.value) || 0))
  const dailyTasks = tasks.value.map((t) => t.trim()).filter(Boolean).slice(0, 5)

  submitting.value = true
  try {
    const payload = {
      planName: name,
      planDesc: form.planDesc.trim() || undefined,
      planType: form.planType,
      targetDays,
      remindTime: form.remindTime || undefined,
      dailyTasks
    }
    if (editId.value) {
      await updatePlan({ ...payload, id: editId.value, status: status.value })
      uni.showToast({ title: '已保存', icon: 'success' })
    } else {
      await createPlan(payload)
      uni.showToast({ title: '创建成功，猫猫已加入！', icon: 'success' })
    }
    setTimeout(() => uni.navigateBack(), 800)
  } catch {
    // 统一错误提示
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-page {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.ai-card {
  background: $pixel-blue;

  .ai-head {
    margin-bottom: 16rpx;

    .ai-tip {
      display: block;
      margin-top: 6rpx;
      font-size: 22rpx;
      color: rgba(255, 251, 239, 0.9);
    }
  }

  .ai-row {
    display: flex;
    gap: 16rpx;

    .ai-input {
      flex: 1;
      @include pixel-block;
      background: #fff;
      height: 72rpx;
      padding: 0 20rpx;
      font-size: 26rpx;
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
  min-height: 120rpx;
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

.type-grid {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;

  .type-chip {
    @include pixel-btn($pixel-card-alt, $pixel-ink);
    height: 64rpx;
    font-size: 26rpx;
    padding: 0 24rpx;

    &.active {
      background: $pixel-primary;
      color: #fff;
    }
  }
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.task-row {
  display: flex;
  gap: 16rpx;
  align-items: center;

  .task-input {
    flex: 1;
  }

  .task-del {
    @include pixel-btn($pixel-red);
    width: 64rpx;
    height: 64rpx;
    font-size: 26rpx;
    padding: 0;
    flex-shrink: 0;
  }
}

.task-add {
  @include pixel-btn($pixel-card-alt, $pixel-green-dark);
  height: 64rpx;
  font-size: 26rpx;
}

.submit {
  width: 100%;
  margin-top: 8rpx;
}
</style>
