<template>
  <view class="page">
    <!-- 创建模板 -->
    <view class="pixel-card section">
      <text class="pixel-h2">✏️ 创建模板</text>
      <text class="tip">admin 创建自动为官方模板；普通用户创建进入公开市场。套用方式：列表内「一键套用」直接建计划</text>
      <input
        v-model="form.templateName"
        class="pixel-input"
        :maxlength="128"
        placeholder="模板名称（如：21 天早起挑战）"
        placeholder-class="pixel-placeholder"
      />
      <input
        v-model="form.templateDesc"
        class="pixel-input"
        :maxlength="512"
        placeholder="模板描述（可选）"
        placeholder-class="pixel-placeholder"
      />
      <view class="two-col">
        <input
          v-model="daysText"
          class="pixel-input"
          type="number"
          :maxlength="4"
          placeholder="目标天数（默认 21）"
          placeholder-class="pixel-placeholder"
        />
        <picker mode="selector" :range="typeLabels" @change="onTypeChange">
          <view class="pixel-input picker-text">类型：{{ typeLabels[form.planType] }}</view>
        </picker>
      </view>
      <view class="task-list">
        <view v-for="(t, i) in tasks" :key="i" class="task-row">
          <input v-model="tasks[i]" class="pixel-input task-input" :maxlength="50" />
          <view class="task-del" @tap="tasks.splice(i, 1)">✕</view>
        </view>
        <view v-if="tasks.length < 5" class="task-add" @tap="tasks.push('')">＋ 加一项任务</view>
      </view>
      <button class="pixel-btn-green" :loading="creating" @tap="doCreate">保存模板</button>
    </view>

    <!-- AI 生成模板 -->
    <view class="pixel-card section">
      <text class="pixel-h2">🤖 AI 生成模板</text>
      <input
        v-model="aiDesc"
        class="pixel-input"
        :maxlength="500"
        placeholder="描述想要的计划，如：21 天早起阅读挑战"
        placeholder-class="pixel-placeholder"
        confirm-type="done"
      />
      <button class="pixel-btn" :loading="aiLoading" @tap="genTemplate">AI 帮我生成并存入市场</button>
    </view>

    <!-- 模板列表 -->
    <view class="pixel-card section">
      <view class="flex-between">
        <text class="pixel-h2">📚 模板市场（{{ total }}）</text>
        <button class="pixel-btn-sm" :disabled="current >= pages" @tap="nextPage">下一页</button>
      </view>
      <view v-for="t in templates" :key="t.id" class="tpl-row">
        <view class="tpl-main">
          <view class="tpl-line">
            <text class="tpl-name">{{ t.templateName }}</text>
            <text v-if="t.isOfficial" class="pixel-tag official-tag">官方</text>
          </view>
          <text class="tpl-desc">{{ t.templateDesc || '暂无描述' }}</text>
          <text class="tpl-meta">
            {{ typeName(t.planType) }} · {{ t.targetDays }} 天 · {{ (t.dailyTasks ?? []).length }} 项任务 · 已被套用 {{ t.useCount }} 次 · by {{ t.creatorName }}
          </text>
        </view>
        <view class="tpl-ops">
          <button class="pixel-btn-sm-green" :loading="applyingId === t.id" @tap="doApply(t)">一键套用</button>
          <button
            v-if="t.creatorId === meId || isAdmin"
            class="pixel-btn-sm-red"
            @tap="doDelete(t)"
          >
            删除
          </button>
        </view>
      </view>
      <text v-if="templates.length === 0" class="empty-line">市场还没有模板，创建第一个吧</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { createTemplate, getTemplateMarket, removeTemplate } from '@/api/template'
import { applyPlanTemplate } from '@/api/plan'
import { getPlanDraft } from '@/api/ai'
import { ensureLogin } from '@/utils/auth'
import { useUserStore } from '@/stores/user'
import type { TemplateVO } from '@/types/api'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.userInfo?.userRole === 'admin')
const meId = computed(() => userStore.userInfo?.id ?? -1)

const templates = ref<TemplateVO[]>([])
const current = ref(1)
const pages = ref(1)
const total = ref(0)
const creating = ref(false)
const applyingId = ref<number | null>(null)
const aiLoading = ref(false)
const aiDesc = ref('')

const form = reactive({
  templateName: '',
  templateDesc: '',
  planType: 0
})
const daysText = ref('21')
const tasks = ref<string[]>([''])
const typeLabels = ['学习', '运动', '阅读', '其他']

const typeName = (t: number) => typeLabels[t] ?? '其他'

function nextPage() {
  if (current.value < pages.value) loadPage(current.value + 1)
}

function onTypeChange(e: { detail: { value: string } }) {
  form.planType = Number(e.detail.value)
}

function loadPage(page: number) {
  getTemplateMarket(page)
    .then((d) => {
      templates.value = d.records
      current.value = d.current
      pages.value = d.pages || 1
      total.value = d.total
    })
    .catch(() => {})
}

onMounted(() => {
  if (!ensureLogin()) return
  loadPage(1)
})

onShow(() => {
  if (!userStore.isLoggedIn) return
  loadPage(current.value)
})

async function doCreate() {
  if (creating.value) return
  const name = form.templateName.trim()
  if (!name) {
    uni.showToast({ title: '给模板起个名字', icon: 'none' })
    return
  }
  const days = Number(daysText.value) || 21
  if (days < 1 || days > 3650) {
    uni.showToast({ title: '目标天数须在 1~3650 之间', icon: 'none' })
    return
  }
  const taskList = tasks.value.map((t) => t.trim()).filter(Boolean)
  if (taskList.length === 0) {
    uni.showToast({ title: '至少一项每日任务', icon: 'none' })
    return
  }
  creating.value = true
  try {
    await createTemplate({
      templateName: name,
      templateDesc: form.templateDesc.trim() || undefined,
      planType: form.planType,
      targetDays: days,
      dailyTasks: taskList
    })
    uni.showToast({ title: '模板已保存', icon: 'success' })
    form.templateName = ''
    form.templateDesc = ''
    daysText.value = '21'
    tasks.value = ['']
    loadPage(1)
  } catch {
    // 统一提示
  } finally {
    creating.value = false
  }
}

async function genTemplate() {
  const desc = aiDesc.value.trim()
  if (!desc || aiLoading.value) return
  aiLoading.value = true
  try {
    const draft = await getPlanDraft(desc)
    await createTemplate({
      templateName: draft.planName,
      templateDesc: draft.planDesc || undefined,
      planType: draft.planType,
      targetDays: draft.targetDays,
      dailyTasks: draft.dailyTasks
    })
    uni.showToast({ title: 'AI 模板已存入市场', icon: 'success' })
    aiDesc.value = ''
    loadPage(1)
  } catch {
    // 统一提示（AI 不可用等）
  } finally {
    aiLoading.value = false
  }
}

async function doApply(t: TemplateVO) {
  if (applyingId.value) return
  const ok = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '一键套用',
      content: `以「${t.templateName}」创建一个打卡计划？`,
      success: (r) => resolve(!!r.confirm)
    })
  })
  if (!ok) return
  applyingId.value = t.id
  try {
    await applyPlanTemplate(t.id)
    uni.showToast({ title: '计划已创建！', icon: 'success' })
    loadPage(current.value)
  } catch {
    // 统一提示
  } finally {
    applyingId.value = null
  }
}

async function doDelete(t: TemplateVO) {
  const done = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '删除模板',
      content: `删除「${t.templateName}」？`,
      success: (r) => resolve(!!r.confirm)
    })
  })
  if (!done) return
  try {
    await removeTemplate(t.id)
    loadPage(current.value)
  } catch {
    // 统一提示
  }
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

.tip {
  font-size: 22rpx;
  color: $pixel-ink-light;
}

.two-col {
  display: flex;
  gap: 12rpx;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.task-row {
  display: flex;
  gap: 12rpx;
  align-items: center;

  .task-input {
    flex: 1;
  }

  .task-del {
    padding: 8rpx 16rpx;
    color: $pixel-red;
    font-weight: 700;
  }
}

.task-add {
  font-size: 24rpx;
  color: $pixel-primary;
  font-weight: 700;
}

.tpl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx dashed $pixel-ink-light;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.tpl-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.tpl-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tpl-name {
  font-size: 26rpx;
  font-weight: 700;
  color: $pixel-ink;
}

.official-tag {
  background: $pixel-primary;
  color: #fffbef;
}

.tpl-desc {
  font-size: 22rpx;
  color: $pixel-ink;
}

.tpl-meta {
  font-size: 20rpx;
  color: $pixel-ink-light;
}

.tpl-ops {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.empty-line {
  font-size: 24rpx;
  color: $pixel-ink-light;
  text-align: center;
  padding: 12rpx 0;
}
</style>
