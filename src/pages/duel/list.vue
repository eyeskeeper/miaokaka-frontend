<template>
  <view class="duel-list">
    <!-- 收件箱（拍一拍） -->
    <view v-if="nudgeCount > 0" class="nudge-banner pixel-card" @tap="openInbox">
      <image class="pixelated" src="/static/pixel/icon-bell.png" />
      <text class="nudge-text">收到 {{ nudgeCount }} 条拍一拍催打卡！</text>
      <text class="nudge-go">查看 ▶</text>
    </view>

    <!-- 招募大厅：别人发起的、可加入的招募中死斗 -->
    <view v-if="hall.length" class="hall-section pixel-card">
      <view class="flex-between">
        <text class="pixel-h2">🏟 招募大厅</text>
        <text class="hall-tip">押上喵币，随时参战</text>
      </view>
      <view v-for="duel in hall" :key="duel.id" class="hall-row">
        <view class="hall-info">
          <text class="hall-name">⚔️ {{ duel.duelName }}</text>
          <text class="hall-meta">👥 {{ duel.memberCount }}人 · 💰奖池 {{ duel.totalPool }} · ⏳ {{ duel.totalDays }}天 · 押金 {{ duel.depositPerMember }}</text>
        </view>
        <button class="pixel-btn-sm-green" @tap="joinHallDuel(duel)">加入</button>
      </view>
    </view>

    <!-- 列表 -->
    <view class="section-title" v-if="duelStore.duels.length"><text class="pixel-h2">📋 我的死斗</text></view>
    <view v-for="duel in duelStore.duels" :key="duel.id" class="duel-card pixel-card" @tap="goDetail(duel.id)">
      <view class="flex-between">
        <text class="duel-name">⚔️ {{ duel.duelName }}</text>
        <text class="pixel-tag" :class="statusClass(duel.status)">{{ duelStatusLabel(duel.status) }}</text>
      </view>
      <text v-if="duel.duelDesc" class="duel-desc">{{ duel.duelDesc }}</text>
      <view class="duel-meta">
        <view class="meta-chip"><text>👥 {{ duel.memberCount }} 人</text></view>
        <view class="meta-chip coin">
          <image class="pixelated" src="/static/pixel/icon-coin.png" />
          <text>奖池 {{ duel.totalPool }}</text>
        </view>
        <view class="meta-chip"><text>⏳ {{ duel.totalDays }} 天</text></view>
        <view v-if="duel.pendingCount > 0 && duel.myRole === 'leader'" class="meta-chip pending">
          <text>待审核 {{ duel.pendingCount }}</text>
        </view>
      </view>
      <view class="flex-between duel-foot">
        <text class="duel-role">{{ duel.myRole === 'leader' ? '👑 我是组长' : '🛡 组员' }} · 押金 {{ duel.depositPerMember }}</text>
        <text class="duel-date">{{ duel.startDate }} ~ {{ duel.endDate }}</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!duelStore.loading && duelStore.duels.length === 0" class="empty pixel-card">
      <image class="pixelated" src="/static/pixel/icon-sword.png" />
      <text class="empty-title">没有进行中的死斗</text>
      <text class="empty-sub">押上喵币和好友互卷，断卡就扣钱！</text>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-btns">
      <button class="pixel-btn-green" @tap="goCreate">⚔️ 发起死斗</button>
      <button class="pixel-btn code-btn" @tap="openCodeInput">🎟 邀请码加入</button>
      <button class="pixel-btn template-btn" @tap="openTemplate">📢 拍一拍文案</button>
    </view>

    <!-- 邀请码输入弹窗 -->
    <view v-if="showCodeInput" class="modal-mask" @tap="showCodeInput = false">
      <view class="modal pixel-card" @tap.stop>
        <text class="pixel-h2">🎟 使用邀请码</text>
        <input
          v-model="codeInput"
          class="pixel-input code-input"
          :maxlength="16"
          placeholder="输入好友分享的邀请码"
          placeholder-class="pixel-placeholder"
        />
        <button class="pixel-btn-green" :loading="usingCode" @tap="submitCode">加入死斗</button>
      </view>
    </view>

    <!-- 收件箱弹窗 -->
    <view v-if="showInbox" class="modal-mask" @tap="showInbox = false">
      <view class="modal pixel-card" @tap.stop>
        <text class="pixel-h2">📬 拍一拍收件箱</text>
        <scroll-view scroll-y class="inbox-scroll">
          <view v-for="(item, i) in inboxItems" :key="i" class="inbox-item">
            <text class="inbox-from">{{ item.fromUserName }}</text>
            <text class="inbox-text">{{ item.text }}</text>
            <text class="inbox-time">{{ item.time }}</text>
          </view>
        </scroll-view>
        <text class="inbox-tip">已读即清空（当日有效）</text>
        <button class="pixel-btn-sm" @tap="showInbox = false">知道了</button>
      </view>
    </view>

    <!-- 模板编辑弹窗 -->
    <view v-if="showTemplate" class="modal-mask" @tap="showTemplate = false">
      <view class="modal pixel-card" @tap.stop>
        <text class="pixel-h2">📢 我的拍一拍文案</text>
        <input v-model="templateText" class="pixel-input tpl-input" :maxlength="20" placeholder="≤20字，留空恢复默认" placeholder-class="pixel-placeholder" />
        <text class="tpl-effective">实际生效：{{ effectiveText || '戳了戳你，快去打卡！' }}</text>
        <view class="modal-btns">
          <button class="pixel-btn-sm" @tap="showTemplate = false">取消</button>
          <button class="pixel-btn-sm-green" @tap="saveTemplate">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import { ref } from 'vue'
import { getJoinApplications, getMyNudges, getNudgeTemplate, getRecruitingHall, saveNudgeTemplate, useInviteCode, joinDuel as joinDuelApi } from '@/api/duel'
import { duelStatusLabel } from '@/constants/pixel'
import { useDuelStore } from '@/stores/duel'
import { useUserStore } from '@/stores/user'
import type { NudgeItemVO } from '@/types/api'

const duelStore = useDuelStore()
const userStore = useUserStore()

const nudgeCount = ref(0)
const inboxItems = ref<NudgeItemVO[]>([])
const showInbox = ref(false)
const showTemplate = ref(false)
const templateText = ref('')
const effectiveText = ref('')
const showCodeInput = ref(false)
const codeInput = ref('')
const usingCode = ref(false)
/** 招募大厅：招募中且我未加入的死斗 */
const hall = ref<any[]>([])

function refreshHall() {
  getRecruitingHall()
    .then((list) => {
      const mine = new Set(duelStore.duels.map((d) => d.id))
      hall.value = (list || []).filter((d) => !mine.has(d.id))
    })
    .catch(() => {
      hall.value = [] // 后端接口未上线或无数据时静默降级
    })
}

async function joinHallDuel(duel: any) {
  const ok = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '加入死斗',
      content: `将扣押金 ${duel.depositPerMember} 喵币，确定加入「${duel.duelName}」？`,
      success: (res) => resolve(!!res.confirm)
    })
  })
  if (!ok) return
  try {
    await joinDuelApi(duel.id)
    uni.showToast({ title: '加入成功！', icon: 'success' })
    duelStore.fetchDuels(true)
    refreshHall()
  } catch {
    // 余额不足/已满员等，统一提示
  }
}

onShow(async () => {
  if (!ensureLogin()) return
  duelStore.fetchDuels(true)
  // 静默查收拍一拍（读取即消费，先存本地展示）
  try {
    const box = await getMyNudges()
    nudgeCount.value = box.count
    inboxItems.value = box.items || []
  } catch {
    // 静默
  }
})

const statusClass = (status: number) =>
  ({ 0: 'st-recruiting', 1: 'st-ongoing', 2: 'st-ended' } as Record<number, string>)[status] ?? ''

function openInbox() {
  showInbox.value = true
  nudgeCount.value = 0
}

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/duel/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/duel/create' })
}

async function openTemplate() {
  showTemplate.value = true
  try {
    const tpl = await getNudgeTemplate()
    templateText.value = tpl.nudgeText || ''
    effectiveText.value = tpl.effectiveText || ''
  } catch {
    // 统一提示
  }
}

function openCodeInput() {
  codeInput.value = ''
  showCodeInput.value = true
}

async function submitCode() {
  const code = codeInput.value.trim()
  if (!code) {
    uni.showToast({ title: '先输入邀请码', icon: 'none' })
    return
  }
  if (usingCode.value) return
  usingCode.value = true
  try {
    const result = await useInviteCode(code)
    showCodeInput.value = false
    duelStore.fetchDuels(true)
    if (result.action === 'apply') {
      uni.showToast({ title: '申请已提交，等待组长审批', icon: 'none' })
    } else {
      uni.showToast({ title: '加入成功！', icon: 'success' })
      if (result.duel?.id) {
        setTimeout(() => uni.navigateTo({ url: `/pages/duel/detail?id=${result.duel.id}` }), 600)
      }
    }
  } catch {
    // 邀请码无效/已满员等，统一提示
  } finally {
    usingCode.value = false
  }
}

async function saveTemplate() {
  try {
    const tpl = await saveNudgeTemplate(templateText.value.trim())
    effectiveText.value = tpl.effectiveText
    showTemplate.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch {
    // 统一提示
  }
}
</script>

<style lang="scss" scoped>
.duel-list {
  padding: 24rpx 24rpx 60rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.nudge-banner {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: $pixel-yellow;

  image {
    width: 40rpx;
    height: 40rpx;
  }

  .nudge-text {
    flex: 1;
    font-size: 26rpx;
    font-weight: 800;
    color: $pixel-ink;
  }

  .nudge-go {
    font-size: 24rpx;
    font-weight: 800;
    color: $pixel-primary-dark;
  }
}

.duel-card {
  .duel-name {
    @include pixel-title;
    font-size: 30rpx;
  }

  .duel-desc {
    display: block;
    margin-top: 10rpx;
    font-size: 24rpx;
    color: $pixel-ink-light;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .duel-meta {
    display: flex;
    gap: 12rpx;
    margin-top: 14rpx;
    flex-wrap: wrap;
  }

  .meta-chip {
    display: flex;
    align-items: center;
    gap: 6rpx;
    @include pixel-block;
    padding: 4rpx 12rpx;
    font-size: 20rpx;
    font-weight: 700;
    color: $pixel-ink;

    image {
      width: 24rpx;
      height: 24rpx;
    }

    &.coin {
      color: $pixel-primary-dark;
    }

    &.pending {
      background: $pixel-red;
      color: #fff;
    }
  }

  .duel-foot {
    margin-top: 14rpx;

    .duel-role {
      font-size: 22rpx;
      font-weight: 700;
      color: $pixel-green-dark;
    }

    .duel-date {
      font-size: 20rpx;
      color: $pixel-ink-light;
    }
  }
}

.st-recruiting {
  background: $pixel-blue;
  color: #fff;
}

.st-ongoing {
  background: $pixel-green;
  color: #fff;
}

.st-ended {
  background: $pixel-card-alt;
  color: $pixel-ink-light;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 60rpx 40rpx;

  image {
    width: 120rpx;
    height: 120rpx;
  }

  .empty-title {
    @include pixel-title;
    font-size: 32rpx;
  }

  .empty-sub {
    font-size: 24rpx;
    color: $pixel-ink-light;
  }
}

.bottom-btns {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;

  button {
    flex: 1;
  }
}

.template-btn {
  background: $pixel-purple;
}

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
  max-width: 600rpx;

  .inbox-scroll {
    max-height: 50vh;
    margin-top: 20rpx;
  }

  .inbox-item {
    @include pixel-block;
    padding: 16rpx 20rpx;
    margin-bottom: 12rpx;
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .inbox-from {
      font-size: 24rpx;
      font-weight: 900;
      color: $pixel-ink;
    }

    .inbox-text {
      font-size: 26rpx;
      color: $pixel-primary-dark;
      font-weight: 700;
    }

    .inbox-time {
      font-size: 18rpx;
      color: $pixel-ink-light;
    }
  }

  .inbox-tip {
    display: block;
    margin: 16rpx 0;
    font-size: 20rpx;
    color: $pixel-ink-light;
    text-align: center;
  }

  .tpl-input {
    margin-top: 24rpx;
  }

  .tpl-effective {
    display: block;
    margin-top: 12rpx;
    font-size: 22rpx;
    color: $pixel-ink-light;
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
</style>

/* 招募大厅 */
.hall-section {
  .hall-tip {
    font-size: 20rpx;
    color: $pixel-ink-light;
  }

  .hall-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 14rpx;
    @include pixel-block;
    padding: 14rpx 16rpx;

    .hall-info {
      flex: 1;
      min-width: 0;
    }

    .hall-name {
      display: block;
      font-size: 26rpx;
      font-weight: 900;
      color: $pixel-ink;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .hall-meta {
      display: block;
      margin-top: 6rpx;
      font-size: 20rpx;
      color: $pixel-ink-light;
    }
  }
}

.section-title {
  margin-top: 8rpx;
}
