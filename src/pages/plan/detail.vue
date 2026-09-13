<template>
  <view v-if="plan" class="detail">
    <!-- 猫精灵区 -->
    <view class="cat-card pixel-card">
      <view class="cat-main">
        <pixel-cat :cat-type="cat?.catType" :pose="catPose" :size="200" />
        <view class="cat-info">
          <view class="cat-name-row" @tap="openRename">
            <text class="cat-name">{{ cat?.catName || '猫精灵' }}</text>
            <text class="cat-edit">✏️</text>
          </view>
          <text class="cat-level">Lv.{{ cat?.level ?? 1 }} · 击败 BOSS ×{{ cat?.totalBossDefeated ?? 0 }}</text>
          <view class="pixel-progress exp-bar">
            <view class="bar-fill exp-fill" :style="{ width: expPercent + '%' }" />
          </view>
          <text class="exp-text">EXP {{ cat?.experience ?? 0 }}/{{ cat?.expToNextLevel ?? 0 }}</text>
          <view class="cat-stats">
            <view class="stat"><text class="stat-num">{{ cat?.attack ?? 0 }}</text><text class="stat-label">攻击</text></view>
            <view class="stat"><text class="stat-num">{{ cat?.defense ?? 0 }}</text><text class="stat-label">防御</text></view>
            <view class="stat"><text class="stat-num">{{ cat?.maxHp ?? 0 }}</text><text class="stat-label">体力</text></view>
          </view>
        </view>
      </view>
    </view>

    <!-- BOSS 区 -->
    <view class="boss-card pixel-card">
      <view class="boss-head flex-between">
        <text class="pixel-h2">😈 {{ plan.currentStreak > 0 ? `连击 ${plan.currentStreak} 天` : '拦路 BOSS' }}</text>
        <text class="boss-level">LV.{{ cat?.bossLevel ?? 1 }}</text>
      </view>
      <view class="boss-body">
        <image class="pixelated boss-img" :src="bossSrc" mode="aspectFit" />
        <view class="boss-info">
          <text class="boss-name">{{ cat?.bossName ?? ' ??? ' }}</text>
          <view class="pixel-progress boss-hp">
            <view class="bar-fill boss-fill" :style="{ width: bossHpPercent + '%' }" />
          </view>
          <text class="boss-hp-text">HP {{ cat?.bossHp ?? 0 }}/{{ cat?.bossMaxHp ?? 0 }}</text>
        </view>
      </view>

      <!-- 今日状态 / 打卡按钮 -->
      <button
        v-if="plan.status === 0 && !plan.todayChecked && !hasTasks"
        class="pixel-btn check-btn"
        :loading="checking"
        @tap="doCheckIn"
      >
        ⚔️ 立即打卡
      </button>
      <view v-else-if="plan.todayChecked" class="done-banner">✓ 今日已打卡，明天再来！</view>
      <view v-else-if="plan.status !== 0" class="paused-banner">计划已暂停</view>
    </view>

    <!-- 每日任务 -->
    <view v-if="hasTasks" class="task-card pixel-card">
      <view class="flex-between">
        <text class="pixel-h2">📋 今日任务</text>
        <text class="task-progress">{{ taskDoneCount }}/{{ taskTotal }}</text>
      </view>
      <text v-if="plan.todayChecked" class="task-frozen">今日已打卡，任务勾选已冻结</text>
      <view
        v-for="(task, i) in plan.dailyTasks"
        :key="i"
        class="task-item"
        :class="{ done: taskDone[i], frozen: plan.todayChecked }"
        @tap="onToggleTask(i)"
      >
        <view class="task-check">{{ taskDone[i] ? '✓' : '' }}</view>
        <text class="task-text">{{ task }}</text>
      </view>
      <text v-if="hasTasks && !plan.todayChecked" class="task-tip">勾满全部任务自动完成今日打卡</text>
    </view>

    <!-- 打卡日历 -->
    <view class="cal-card pixel-card">
      <text class="pixel-h2">📅 打卡日历</text>
      <checkin-calendar ref="calendarRef" :plan-id="planId" class="cal" @makeup-tap="onMakeupTap" />
      <text class="cal-tip">点击虚线日期可补卡（扣 50 喵币，每月 2 次）</text>
    </view>

    <!-- 管理操作 -->
    <view class="manage">
      <button class="pixel-btn-sm-green" @tap="togglePause">
        {{ plan.status === 0 ? '⏸ 暂停计划' : '▶ 恢复计划' }}
      </button>
      <button class="pixel-btn-sm" @tap="goEdit">✏️ 编辑</button>
      <button class="pixel-btn-sm-red" @tap="confirmDelete">🗑 删除</button>
    </view>

    <!-- 战斗结算 -->
    <battle-result :visible="showBattle" :result="battleResult" :boss-level="cat?.bossLevel ?? 1" @close="closeBattle" />

    <!-- 改名弹窗 -->
    <view v-if="showRename" class="modal-mask" @tap="showRename = false">
      <view class="modal pixel-card" @tap.stop>
        <text class="pixel-h2">给猫猫改个名</text>
        <input v-model="renameText" class="pixel-input rename-input" :maxlength="64" placeholder="新名字" placeholder-class="pixel-placeholder" />
        <view class="modal-btns">
          <button class="pixel-btn-sm" @tap="showRename = false">取消</button>
          <button class="pixel-btn-sm-green" @tap="doRename">确定</button>
        </view>
      </view>
    </view>

    <!-- 补卡确认 -->
    <view v-if="makeupDate" class="modal-mask" @tap="makeupDate = ''">
      <view class="modal pixel-card" @tap.stop>
        <text class="pixel-h2">补卡确认</text>
        <text class="makeup-text">{{ makeupDate }} 没打卡，要花 <text class="coin">50 喵币</text> 补上吗？</text>
        <text class="makeup-sub">本月剩余补卡次数以服务端为准；补卡不触发随机事件</text>
        <view class="modal-btns">
          <button class="pixel-btn-sm" @tap="makeupDate = ''">再想想</button>
          <button class="pixel-btn-sm" :loading="makeupLoading" @tap="doMakeup">确认补卡</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { checkIn, makeupCheckIn } from '@/api/checkin'
import { deletePlan, getPlanDetail, renameCat, toggleTask, updatePlan } from '@/api/plan'
import BattleResult from '@/components/battle-result/battle-result.vue'
import CheckinCalendar from '@/components/checkin-calendar/checkin-calendar.vue'
import PixelCat from '@/components/pixel-cat/pixel-cat.vue'
import { bossSprite } from '@/constants/pixel'
import { usePlanStore } from '@/stores/plan'
import { useUserStore } from '@/stores/user'
import type { CheckInResultVO, PlanVO, TaskToggleVO } from '@/types/api'
import { storage } from '@/utils/storage'

const planStore = usePlanStore()
const userStore = useUserStore()

const planId = ref(0)
const plan = ref<PlanVO | null>(null)
const checking = ref(false)
const showBattle = ref(false)
const battleResult = ref<CheckInResultVO | null>(null)
const calendarRef = ref<{ reload: () => void } | null>(null)

// 任务勾选（后端未暴露今日位图，本地按天缓存兜底；toggle 为幂等赋值，重复发送安全）
const taskDone = reactive<boolean[]>([])
const showRename = ref(false)
const renameText = ref('')
const makeupDate = ref('')
const makeupLoading = ref(false)

const cat = computed(() => plan.value?.cat ?? null)
const catPose = computed(() => (plan.value?.todayChecked ? 'happy' : 'idle'))
const hasTasks = computed(() => (plan.value?.dailyTasks?.length ?? 0) > 0)
const taskTotal = computed(() => plan.value?.dailyTasks?.length ?? 0)
const taskDoneCount = computed(() => taskDone.filter(Boolean).length)

const expPercent = computed(() => {
  const c = cat.value
  if (!c || !c.expToNextLevel) return 0
  return Math.min(100, Math.round((c.experience / c.expToNextLevel) * 100))
})

const bossSrc = computed(() => bossSprite(cat.value?.bossLevel))
const bossHpPercent = computed(() => {
  const c = cat.value
  if (!c || !c.bossMaxHp) return 0
  return Math.max(0, Math.round((c.bossHp / c.bossMaxHp) * 100))
})

const taskCacheKey = computed(() => `taskState_${planId.value}`)

function loadTaskCache() {
  const cache = storage.get<{ date: string; progress: string }>(taskCacheKey.value)
  const today = new Date().toISOString().slice(0, 10)
  const progress = cache && cache.date === today ? cache.progress : ''
  taskDone.length = 0
  for (let i = 0; i < taskTotal.value; i++) taskDone[i] = progress[i] === '1'
}

function saveTaskCache(progress: string) {
  storage.set(taskCacheKey.value, { date: new Date().toISOString().slice(0, 10), progress })
}

async function load() {
  if (!planId.value) return
  try {
    plan.value = await getPlanDetail(planId.value)
    loadTaskCache()
  } catch {
    uni.showToast({ title: '计划加载失败', icon: 'none' })
  }
}

onLoad((options) => {
  planId.value = Number(options?.id || 0)
})

onShow(() => {
  load()
})

async function doCheckIn() {
  if (checking.value) return
  checking.value = true
  try {
    battleResult.value = await checkIn({ planId: planId.value })
    showBattle.value = true
    refreshAfterSettle()
  } catch {
    // 统一提示
  } finally {
    checking.value = false
  }
}

async function onToggleTask(index: number) {
  if (!plan.value || plan.value.todayChecked || plan.value.status !== 0) return
  const next = !taskDone[index]
  taskDone[index] = next
  try {
    const vo: TaskToggleVO = await toggleTask(planId.value, index, next)
    // 以后端位图为准并缓存
    if (vo.taskProgress) {
      for (let i = 0; i < taskDone.length; i++) taskDone[i] = vo.taskProgress[i] === '1'
      saveTaskCache(vo.taskProgress)
    }
    if (vo.autoChecked && vo.checkInResult) {
      battleResult.value = vo.checkInResult
      showBattle.value = true
      refreshAfterSettle()
    }
  } catch {
    taskDone[index] = !next // 失败回滚
  }
}

function refreshAfterSettle() {
  load()
  planStore.fetchPlans(true)
  userStore.fetchMe()
}

function closeBattle() {
  showBattle.value = false
}

function openRename() {
  renameText.value = cat.value?.catName ?? ''
  showRename.value = true
}

async function doRename() {
  const name = renameText.value.trim()
  if (!name || !cat.value) {
    showRename.value = false
    return
  }
  try {
    await renameCat(planId.value, name)
    showRename.value = false
    load()
    uni.showToast({ title: '改名成功', icon: 'success' })
  } catch {
    // 统一提示
  }
}

function onMakeupTap(date: string) {
  makeupDate.value = date
}

async function doMakeup() {
  if (!makeupDate.value || makeupLoading.value) return
  makeupLoading.value = true
  try {
    await makeupCheckIn(planId.value, makeupDate.value)
    makeupDate.value = ''
    uni.showToast({ title: `补卡成功，-50 喵币`, icon: 'none' })
    calendarRef.value?.reload()
    refreshAfterSettle()
  } catch {
    // 统一提示（余额不足/次数用尽等）
  } finally {
    makeupLoading.value = false
  }
}

async function togglePause() {
  if (!plan.value) return
  const next = plan.value.status === 0 ? 1 : 0
  try {
    await updatePlan({ id: planId.value, status: next })
    load()
    planStore.fetchPlans(true)
  } catch {
    // 统一提示
  }
}

function goEdit() {
  uni.navigateTo({ url: `/pages/plan/create?id=${planId.value}` })
}

function confirmDelete() {
  uni.showModal({
    title: '删除计划',
    content: '猫猫会随计划一起离开猫窝，确定删除吗？',
    confirmColor: '#D95763',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await deletePlan(planId.value)
        planStore.removePlan(planId.value)
        uni.showToast({ title: '已删除', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 600)
      } catch {
        // 统一提示
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.detail {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 猫区 */
.cat-card {
  background: $pixel-yellow;

  .cat-main {
    display: flex;
    gap: 24rpx;
    align-items: center;
  }

  .cat-name-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .cat-name {
    font-size: 36rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .cat-edit {
    font-size: 24rpx;
  }

  .cat-level {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    font-weight: 700;
    color: rgba(74, 55, 40, 0.7);
  }

  .exp-bar {
    margin-top: 14rpx;

    .exp-fill {
      display: block;
      background: $pixel-blue;
    }
  }

  .exp-text {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    font-weight: 700;
    color: rgba(74, 55, 40, 0.7);
  }

  .cat-stats {
    display: flex;
    gap: 20rpx;
    margin-top: 14rpx;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    @include pixel-block;
    background: rgba(255, 251, 239, 0.8);
    padding: 6rpx 20rpx;

    .stat-num {
      font-size: 28rpx;
      font-weight: 900;
      color: $pixel-ink;
    }

    .stat-label {
      font-size: 18rpx;
      color: $pixel-ink-light;
    }
  }
}

/* BOSS 区 */
.boss-card {
  .boss-level {
    @include pixel-tag;
    background: $pixel-purple;
    color: #fff;
  }

  .boss-body {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-top: 16rpx;
  }

  .boss-img {
    width: 140rpx;
    height: 140rpx;
  }

  .boss-info {
    flex: 1;
  }

  .boss-name {
    @include pixel-title;
    font-size: 30rpx;
  }

  .boss-hp {
    margin-top: 12rpx;

    .boss-fill {
      display: block;
      background: $pixel-red;
    }
  }

  .boss-hp-text {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    color: $pixel-ink-light;
    font-weight: 700;
  }

  .check-btn {
    width: 100%;
    margin-top: 24rpx;
    font-size: 32rpx;
  }

  .done-banner {
    @include pixel-btn($pixel-green);
    width: 100%;
    margin-top: 24rpx;
    font-size: 28rpx;
  }

  .paused-banner {
    @include pixel-btn($pixel-card-alt, $pixel-ink-light);
    width: 100%;
    margin-top: 24rpx;
    font-size: 28rpx;
  }
}

/* 任务 */
.task-card {
  .task-progress {
    @include pixel-tag;
  }

  .task-frozen {
    display: block;
    margin-top: 12rpx;
    font-size: 22rpx;
    color: $pixel-ink-light;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    @include pixel-block;
    margin-top: 16rpx;
    padding: 18rpx 20rpx;

    &.done {
      background: $pixel-green;

      .task-text {
        color: #fff;
        text-decoration: line-through;
      }
    }

    &.frozen {
      opacity: 0.7;
    }

    .task-check {
      width: 44rpx;
      height: 44rpx;
      @include pixel-card(#fff);
      border-width: 3rpx;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 900;
      color: $pixel-green-dark;
      flex-shrink: 0;
    }

    .task-text {
      font-size: 26rpx;
      font-weight: 700;
      color: $pixel-ink;
    }
  }

  .task-tip {
    display: block;
    margin-top: 12rpx;
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}

/* 日历 */
.cal-card {
  .cal {
    margin-top: 16rpx;
  }

  .cal-tip {
    display: block;
    margin-top: 16rpx;
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}

/* 管理 */
.manage {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  padding-bottom: 40rpx;
}

.pixel-btn-sm-red {
  @include pixel-btn($pixel-red);
  height: 56rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: $uni-bg-color-mask;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.modal {
  width: 100%;
  max-width: 560rpx;

  .rename-input {
    margin-top: 24rpx;
  }

  .modal-btns {
    display: flex;
    gap: 16rpx;
    margin-top: 32rpx;

    button {
      flex: 1;
    }
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

.pixel-placeholder {
  color: $uni-text-color-placeholder;
}

.makeup-text {
  display: block;
  margin-top: 20rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: $pixel-ink;

  .coin {
    color: $pixel-primary-dark;
    font-weight: 900;
  }
}

.makeup-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $pixel-ink-light;
}
</style>
