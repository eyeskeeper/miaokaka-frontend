<template>
  <view class="duel-list">
    <NudgeBubble />

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
      <button class="pixel-btn-green btn-create" @tap="goCreate">⚔️ 发起死斗</button>
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
import NudgeBubble from '@/components/nudge-bubble/nudge-bubble.vue'
import { ensureLogin } from '@/utils/auth'
import { ref } from 'vue'
import { getNudgeTemplate, saveNudgeTemplate, useInviteCode } from '@/api/duel'
import { duelStatusLabel } from '@/constants/pixel'
import { useDuelStore } from '@/stores/duel'
import { useUserStore } from '@/stores/user'

const duelStore = useDuelStore()
const userStore = useUserStore()

const showTemplate = ref(false)
const templateText = ref('')
const effectiveText = ref('')
const showCodeInput = ref(false)
const codeInput = ref('')
const usingCode = ref(false)

onShow(async () => {
  if (!ensureLogin()) return
  duelStore.fetchDuels(true)
})

const statusClass = (status: number) =>
  ({ 0: 'st-recruiting', 1: 'st-ongoing', 2: 'st-ended' } as Record<number, string>)[status] ?? ''

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

.section-title {
  margin-top: 8rpx;
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
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 8rpx;

  // 主操作通栏，次级操作并排：避免三个按钮挤一行文字折行出界
  .btn-create {
    flex: 1 1 100%;
  }

  .code-btn,
  .template-btn {
    flex: 1;
    min-width: 0;
    padding: 0 12rpx;
    font-size: 26rpx;
    letter-spacing: 0;
    white-space: nowrap;
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
