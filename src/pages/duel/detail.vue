<template>
  <view v-if="duel" class="detail">
    <!-- 头部信息 -->
    <view class="head-card pixel-card">
      <view class="flex-between">
        <text class="duel-name">⚔️ {{ duel.duelName }}</text>
        <text class="pixel-tag" :class="statusClass(duel.status)">{{ duelStatusLabel(duel.status) }}</text>
      </view>
      <text v-if="duel.duelDesc" class="duel-desc">{{ duel.duelDesc }}</text>
      <view v-if="duel.status === 0 && isMember" class="invite-row" @tap.stop="openInvite">
        <text class="invite-text">🎟 邀请好友</text>
        <text class="invite-tip">{{ duel.myRole === 'leader' ? '组长邀请 · 扫码直接入组' : '成员邀请' }}</text>
      </view>
      <view class="head-stats">
        <view class="hs"><text class="hs-num">{{ duel.totalPool }}</text><text class="hs-label">奖池喵币</text></view>
        <view class="hs"><text class="hs-num">{{ duel.memberCount }}</text><text class="hs-label">成员</text></view>
        <view class="hs"><text class="hs-num">{{ duel.totalDays }}</text><text class="hs-label">总天数</text></view>
        <view class="hs"><text class="hs-num">{{ duel.depositPerMember }}</text><text class="hs-label">每人押金</text></view>
      </view>
      <text class="head-date">{{ duel.startDate }} → {{ duel.endDate }}</text>
    </view>

    <!-- 我的打卡区（进行中且是成员） -->
    <view v-if="isMember && duel.status === 1" class="checkin-card pixel-card">
      <text class="pixel-h2">📸 今日凭证打卡</text>
      <text class="checkin-tip">上传打卡照片，组长审核通过后生效</text>
      <view v-if="myTodayProofUrl" class="proof-preview">
        <image class="pixelated" :src="myTodayProofUrl" mode="aspectFill" />
        <text class="proof-wait">⏳ 待组长审核</text>
      </view>
      <view v-else class="proof-upload" @tap="chooseProof">
        <image class="pixelated" src="/static/pixel/icon-camera.png" />
        <text>拍照/选图 打卡</text>
      </view>
      <text v-if="myStatusText" class="my-status">{{ myStatusText }}</text>
    </view>

    <!-- 组长审核区 -->
    <view v-if="isLeader && duel.status === 1" class="review-card pixel-card">
      <view class="flex-between">
        <text class="pixel-h2">🛡 待审核凭证</text>
        <button class="pixel-btn-sm-green" @tap="loadPending">刷新</button>
      </view>
      <view v-if="pendingList.length === 0" class="review-empty">暂无待审核凭证</view>
      <view v-for="item in pendingList" :key="item.recordId" class="review-item">
        <image
          class="pixelated review-img"
          :src="item.previewUrl || item.imageUrl"
          mode="aspectFill"
          @tap="previewImage(item.previewUrl || item.imageUrl)"
        />
        <view class="review-info">
          <text class="review-user">{{ item.userName }} · {{ item.checkInDate }}</text>
          <text v-if="item.remark" class="review-remark">{{ item.remark }}</text>
          <view v-if="item.aiSuggestion !== 0" class="ai-badge" :class="item.aiSuggestion > 0 ? 'ai-pass' : 'ai-reject'">
            {{ item.aiSuggestion > 0 ? '🤖 AI 建议通过' : '🤖 AI 建议复核' }}
            <text v-if="item.aiReason">：{{ item.aiReason }}</text>
          </view>
          <view class="review-btns">
            <button class="pixel-btn-sm-green" @tap="review(item, true)">通过</button>
            <button class="pixel-btn-sm-red" @tap="openReject(item)">驳回</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 加入申请审批（组长 + 招募中） -->
    <view v-if="isLeader && duel.status === 0" class="apply-card pixel-card">
      <view class="flex-between">
        <text class="pixel-h2">📨 加入申请</text>
        <button class="pixel-btn-sm-green" @tap="loadJoinRequests">刷新</button>
      </view>
      <view v-if="joinRequests.length === 0" class="apply-empty">暂无加入申请</view>
      <view v-for="item in joinRequests" :key="item.id" class="apply-row">
        <view class="apply-info">
          <text class="apply-name">{{ item.userName }}</text>
          <text class="apply-time">{{ item.createTime }}</text>
        </view>
        <view class="apply-btns">
          <button class="pixel-btn-sm-green" @tap="reviewApply(item, true)">通过</button>
          <button class="pixel-btn-sm-red" @tap="reviewApply(item, false)">驳回</button>
        </view>
      </view>
    </view>

    <!-- 成员列表 -->
    <view class="member-card pixel-card">
      <text class="pixel-h2">👥 成员进度</text>
      <view v-for="m in duel.members" :key="m.userId" class="member-row">
        <view class="member-avatar">{{ m.userName.slice(0, 1) }}</view>
        <view class="member-info">
          <view class="flex-row">
            <text class="member-name">{{ m.userName }}</text>
            <text v-if="m.isLeader" class="pixel-tag leader-tag">组长</text>
          </view>
          <text class="member-days">坚持 {{ m.days }} 天 · 押金 {{ m.deposit }}</text>
        </view>
        <text class="member-status" :class="memberStatusClass(m.status)">{{ memberText(m) }}</text>
        <button
          v-if="canNudge(m)"
          class="pixel-btn-sm nudge-btn"
          :loading="nudgingId === m.userId"
          @tap="doNudge(m)"
        >
          拍一拍
        </button>
      </view>
    </view>

    <!-- 操作区 -->
    <view class="actions">
      <button v-if="duel.status === 0 && !isMember" class="pixel-btn-green" :loading="joining" @tap="doJoin">
        💰 押 {{ duel.depositPerMember }} 喵币 加入
      </button>
      <button v-if="duel.status === 0 && isMember && duel.myRole !== 'leader'" class="pixel-btn-sm-red" :loading="quitting" @tap="doQuit">
        退出并退款
      </button>
    </view>

    <!-- 邀请海报弹窗 -->
    <view v-if="inviteVisible" class="modal-mask" @tap="inviteVisible = false">
      <view class="modal pixel-card invite-modal" @tap.stop>
        <text class="pixel-h2">🎟 邀请好友加入</text>
        <image
          v-if="invite"
          class="poster pixelated"
          :src="posterSrc()"
          mode="widthFix"
          @tap="previewImage(posterSrc())"
        />
        <view v-if="invite" class="code-row" @tap="copyCode">
          <text class="code-label">邀请码</text>
          <text class="code-value">{{ invite.code }}</text>
          <text class="code-copy">复制</text>
        </view>
        <text class="invite-note">好友扫码或在大厅输入邀请码即可加入；组长邀请直接入组</text>
        <button class="pixel-btn-sm" @tap="inviteVisible = false">关闭</button>
      </view>
    </view>

    <!-- 驳回理由弹窗 -->
    <view v-if="rejectTarget" class="modal-mask" @tap="rejectTarget = null">
      <view class="modal pixel-card" @tap.stop>
        <text class="pixel-h2">驳回理由（必填）</text>
        <input v-model="rejectReason" class="pixel-input reject-input" :maxlength="255" placeholder="例如：照片看不清打卡内容" placeholder-class="pixel-placeholder" />
        <view class="modal-btns">
          <button class="pixel-btn-sm" @tap="rejectTarget = null">取消</button>
          <button class="pixel-btn-sm-red" :loading="reviewing" @tap="doReject">确认驳回</button>
        </view>
      </view>
    </view>

    <!-- 战斗结算（凭证审核通过时展示被审核者的结算由后端推送，此处仅普通提示） -->
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ensureLogin } from '@/utils/auth'
import {
  getDuelDetail,
  getInvitePoster,
  getJoinApplications,
  getPendingReviews,
  joinDuel,
  nudgeMember,
  quitDuel,
  reviewJoinApplication,
  reviewProof
} from '@/api/duel'
import { BASE_URL } from '@/config'
import { duelStatusLabel, memberStatusLabel } from '@/constants/pixel'
import { useDuelStore } from '@/stores/duel'
import { useUserStore } from '@/stores/user'
import type { DuelVO, InviteVO, JoinRequestVO, MemberVO, ReviewItemVO } from '@/types/api'
import { uploadDuelProof } from '@/utils/upload'

const duelStore = useDuelStore()
const userStore = useUserStore()

const duelId = ref(0)
const duel = ref<DuelVO | null>(null)
const pendingList = ref<ReviewItemVO[]>([])
const myTodayProofUrl = ref('')
const joining = ref(false)
const quitting = ref(false)
const nudgingId = ref<number | null>(null)
const reviewing = ref(false)
const rejectTarget = ref<ReviewItemVO | null>(null)
const rejectReason = ref('')
const inviteVisible = ref(false)
const invite = ref<InviteVO | null>(null)
const inviteLoading = ref(false)
const joinRequests = ref<JoinRequestVO[]>([])
const nudgeRemaining = ref<number | null>(null)

const isLeader = computed(() => duel.value?.myRole === 'leader')
const isMember = computed(() => duel.value?.members.some((m) => m.userId === meId()) ?? false)

function meId(): number {
  return userStore.userInfo?.id ?? -1
}

const myStatusText = computed(() => {
  const me = duel.value?.members.find((m) => m.userId === meId())
  return me ? memberStatusLabel(me.status) : ''
})

const memberText = (m: MemberVO) => memberStatusLabel(m.status) || (m.status === 0 ? '正常' : '')

const memberStatusClass = (status: number) =>
  ({ 2: 'st-quit', 3: 'st-pending' } as Record<number, string>)[status] ?? ''

onLoad((options) => {
  duelId.value = Number(options?.id || 0)
})

onShow(() => {
  if (!ensureLogin()) return
  load()
})

async function load() {
  if (!duelId.value) return
  try {
    duel.value = await getDuelDetail(duelId.value)
    if (isLeader.value && duel.value.status === 1) {
      loadPending()
    }
    if (isLeader.value && duel.value.status === 0) {
      loadJoinRequests()
    }
  } catch {
    // 统一提示
  }
}

async function loadPending() {
  try {
    pendingList.value = (await getPendingReviews(duelId.value)) || []
  } catch {
    // 统一提示
  }
}

function chooseProof() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0]
      try {
        await uploadDuelProof(duelId.value, filePath)
        uni.showToast({ title: '凭证已提交，等待审核', icon: 'none' })
        myTodayProofUrl.value = filePath
        load()
      } catch {
        // 统一提示
      }
    }
  })
}

function review(item: ReviewItemVO, approve: boolean) {
  if (reviewing.value) return
  reviewing.value = true
  reviewProof(duelId.value, item.recordId, approve)
    .then(() => {
      uni.showToast({ title: approve ? '已通过' : '已驳回', icon: 'none' })
      loadPending()
      load()
    })
    .catch(() => {})
    .finally(() => {
      reviewing.value = false
    })
}

function openReject(item: ReviewItemVO) {
  rejectReason.value = ''
  rejectTarget.value = item
}

function doReject() {
  const reason = rejectReason.value.trim()
  if (!reason) {
    uni.showToast({ title: '驳回必须填写理由', icon: 'none' })
    return
  }
  if (!rejectTarget.value) return
  reviewing.value = true
  reviewProof(duelId.value, rejectTarget.value.recordId, false, reason)
    .then(() => {
      rejectTarget.value = null
      uni.showToast({ title: '已驳回', icon: 'none' })
      loadPending()
      load()
    })
    .catch(() => {})
    .finally(() => {
      reviewing.value = false
    })
}

async function doJoin() {
  if (joining.value) return
  joining.value = true
  try {
    duel.value = await joinDuel(duelId.value)
    duelStore.applyDuel(duel.value!)
    uni.showToast({ title: '加入成功，自动创建影子计划！', icon: 'none' })
  } catch {
    // 余额不足等
  } finally {
    joining.value = false
  }
}

async function doQuit() {
  if (quitting.value) return
  const done = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '退出死斗',
      content: '招募期退出全额退款，确定退出？',
      success: (r) => resolve(!!r.confirm)
    })
  })
  if (!done) return
  quitting.value = true
  try {
    duel.value = await quitDuel(duelId.value)
    duelStore.applyDuel(duel.value!)
    uni.showToast({ title: '已退出，押金退回', icon: 'none' })
  } catch {
    // 统一提示
  } finally {
    quitting.value = false
  }
}

function canNudge(m: MemberVO): boolean {
  return duel.value?.status === 1 && m.userId !== meId() && !!duel.value?.members.some((x) => x.userId === meId())
}

async function doNudge(m: MemberVO) {
  if (nudgingId.value) return
  nudgingId.value = m.userId
  try {
    const r = await nudgeMember(duelId.value, m.userId)
    nudgeRemaining.value = r.dailyRemaining
    uni.showToast({ title: `已拍：${r.text}（今日剩 ${r.dailyRemaining} 次）`, icon: 'none' })
  } catch {
    // 统一提示
  } finally {
    nudgingId.value = null
  }
}

async function loadJoinRequests() {
  try {
    joinRequests.value = (await getJoinApplications(duelId.value)) || []
  } catch {
    // 统一提示
  }
}

function openInvite() {
  if (inviteLoading.value) return
  inviteLoading.value = true
  getInvitePoster(duelId.value)
    .then((vo) => {
      invite.value = vo
      inviteVisible.value = true
    })
    .catch(() => {})
    .finally(() => {
      inviteLoading.value = false
    })
}

function posterSrc(): string {
  return invite.value ? BASE_URL + invite.value.posterUrl : ''
}

function copyCode() {
  if (!invite.value) return
  uni.setClipboardData({
    data: invite.value.code,
    success: () => uni.showToast({ title: '邀请码已复制', icon: 'none' })
  })
}

function reviewApply(item: JoinRequestVO, approve: boolean) {
  if (joining.value) return
  joining.value = true
  reviewJoinApplication(duelId.value, { requestId: item.id, approve })
    .then(() => {
      uni.showToast({ title: approve ? '已通过' : '已驳回', icon: 'none' })
      loadJoinRequests()
      load()
    })
    .catch(() => {})
    .finally(() => {
      joining.value = false
    })
}

function previewImage(url: string) {
  uni.previewImage({ urls: [url] })
}

const statusClass = (status: number) =>
  ({ 0: 'st-recruiting', 1: 'st-ongoing', 2: 'st-ended' } as Record<number, string>)[status] ?? ''
</script>

<style lang="scss" scoped>
.detail {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.head-card {
  .duel-name {
    @include pixel-title;
    font-size: 34rpx;
  }

  .duel-desc {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: $pixel-ink-light;
  }

  .head-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
  }

  .hs {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;

    .hs-num {
      font-size: 32rpx;
      font-weight: 900;
      color: $pixel-primary-dark;
    }

    .hs-label {
      font-size: 18rpx;
      color: $pixel-ink-light;
    }
  }

  .head-date {
    display: block;
    margin-top: 16rpx;
    font-size: 22rpx;
    color: $pixel-ink-light;
    text-align: center;
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

/* 打卡区 */
.checkin-card {
  .checkin-tip {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    color: $pixel-ink-light;
  }

  .proof-upload {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    border: 4rpx dashed $pixel-primary;
    background: $pixel-card-alt;
    padding: 48rpx 0;
    color: $pixel-primary-dark;
    font-weight: 800;
    font-size: 26rpx;

    image {
      width: 80rpx;
      height: 80rpx;
    }
  }

  .proof-preview {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;

    image {
      width: 100%;
      height: 320rpx;
      border: 4rpx solid $pixel-ink;
    }

    .proof-wait {
      font-size: 24rpx;
      font-weight: 800;
      color: $pixel-yellow;
      filter: brightness(0.75);
    }
  }

  .my-status {
    display: block;
    margin-top: 16rpx;
    font-size: 22rpx;
    font-weight: 700;
    color: $pixel-green-dark;
  }
}

/* 审核区 */
.review-card {
  .review-empty {
    margin-top: 16rpx;
    text-align: center;
    font-size: 24rpx;
    color: $pixel-ink-light;
  }

  .review-item {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
    @include pixel-block;
    padding: 16rpx;

    .review-img {
      width: 180rpx;
      height: 180rpx;
      border: 3rpx solid $pixel-ink;
      flex-shrink: 0;
    }

    .review-info {
      flex: 1;
      min-width: 0;
    }

    .review-user {
      font-size: 26rpx;
      font-weight: 900;
      color: $pixel-ink;
    }

    .review-remark {
      display: block;
      margin-top: 6rpx;
      font-size: 22rpx;
      color: $pixel-ink-light;
    }

    .ai-badge {
      display: block;
      margin-top: 8rpx;
      font-size: 20rpx;
      font-weight: 700;
      padding: 4rpx 10rpx;
      width: fit-content;

      &.ai-pass {
        background: $pixel-green;
        color: #fff;
      }

      &.ai-reject {
        background: $pixel-yellow;
        color: $pixel-ink;
      }
    }

    .review-btns {
      display: flex;
      gap: 12rpx;
      margin-top: 12rpx;
    }
  }
}

/* 成员 */
.member-card {
  .member-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 16rpx;
    @include pixel-block;
    padding: 14rpx 16rpx;
  }

  .member-avatar {
    width: 64rpx;
    height: 64rpx;
    @include pixel-card($pixel-primary);
    border-width: 3rpx;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 28rpx;
    font-weight: 900;
    flex-shrink: 0;
  }

  .member-info {
    flex: 1;
    min-width: 0;
  }

  .member-name {
    font-size: 26rpx;
    font-weight: 800;
    color: $pixel-ink;
    margin-right: 10rpx;
  }

  .leader-tag {
    background: $pixel-yellow;
  }

  .member-days {
    display: block;
    margin-top: 4rpx;
    font-size: 20rpx;
    color: $pixel-ink-light;
  }

  .member-status {
    font-size: 20rpx;
    font-weight: 700;
    color: $pixel-green-dark;
    flex-shrink: 0;

    &.st-quit {
      color: $pixel-ink-light;
    }

    &.st-pending {
      color: $pixel-blue;
    }
  }

  .nudge-btn {
    flex-shrink: 0;
  }
}

/* 邀横幅与弹窗 */
.invite-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  @include pixel-block;
  background: $pixel-yellow;
  padding: 14rpx 20rpx;

  .invite-text {
    font-size: 26rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .invite-tip {
    font-size: 20rpx;
    color: rgba(74, 55, 40, 0.6);
  }
}

.invite-modal {
  .poster {
    width: 100%;
    margin-top: 16rpx;
    border: 4rpx solid $pixel-ink;
  }

  .code-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-top: 20rpx;
    @include pixel-block;
    background: $pixel-yellow;
    padding: 14rpx 20rpx;

    .code-label {
      font-size: 22rpx;
      color: $pixel-ink-light;
    }

    .code-value {
      flex: 1;
      font-size: 32rpx;
      font-weight: 900;
      letter-spacing: 4rpx;
      color: $pixel-ink;
    }

    .code-copy {
      font-size: 22rpx;
      font-weight: 800;
      color: $pixel-primary-dark;
    }
  }

  .invite-note {
    display: block;
    margin-top: 14rpx;
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}

/* 加入申请 */
.apply-card {
  .apply-empty {
    margin-top: 14rpx;
    text-align: center;
    font-size: 24rpx;
    color: $pixel-ink-light;
  }

  .apply-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 14rpx;
    @include pixel-block;
    padding: 14rpx 16rpx;

    .apply-info {
      flex: 1;
      min-width: 0;
    }

    .apply-name {
      font-size: 26rpx;
      font-weight: 800;
      color: $pixel-ink;
    }

    .apply-time {
      display: block;
      margin-top: 4rpx;
      font-size: 18rpx;
      color: $pixel-ink-light;
    }

    .apply-btns {
      display: flex;
      gap: 12rpx;
    }
  }
}

/* 操作 */
.actions {
  display: flex;
  gap: 16rpx;
  padding-bottom: 40rpx;

  button {
    flex: 1;
  }
}

.pixel-btn-sm-red {
  @include pixel-btn($pixel-red);
  height: 56rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
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

  .reject-input {
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
</style>
