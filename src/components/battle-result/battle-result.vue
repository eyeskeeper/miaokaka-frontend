<template>
  <view v-if="visible && result" class="br-mask" @tap="handleTap">
    <view class="br-panel" @tap.stop>
      <!-- 标题 -->
      <view class="br-head">
        <text class="br-event">{{ eventTitle }}</text>
        <text class="br-date">{{ result.checkInDate }} · {{ result.catName }}</text>
      </view>

      <!-- 对战场 -->
      <view class="br-stage">
        <view class="br-side">
          <image
            class="pixelated br-cat"
            :class="{ 'is-attacking': attacking }"
            :src="catSrc"
            mode="aspectFit"
          />
          <text class="br-side-name">Lv.{{ result.level }} {{ result.catName }}</text>
        </view>

        <text class="br-vs">VS</text>

        <view class="br-side">
          <view class="br-boss-wrap">
            <image class="pixelated br-boss" :src="bossSrc" mode="aspectFit" :class="{ 'is-defeated': result.bossDefeated }" />
            <text v-if="result.bossDefeated" class="br-ko">K.O.!</text>
          </view>
          <text class="br-side-name">{{ result.bossDefeated && result.newBossName ? '下一任 ' + result.newBossName : result.bossName }}</text>
        </view>
      </view>

      <!-- BOSS 血条 -->
      <view class="br-hp">
        <view class="flex-between">
          <text class="br-hp-label">BOSS HP</text>
          <text class="br-hp-num">{{ result.bossHpAfter }}/{{ result.bossHpBefore }}</text>
        </view>
        <view class="pixel-progress br-hp-bar">
          <view class="bar-fill br-hp-fill" :style="{ width: hpPercent + '%' }" />
        </view>
      </view>

      <!-- 结算条目：逐条弹出 -->
      <view class="br-rows">
        <view v-if="result.damage > 0" class="br-row anim" style="--i: 0">
          <text>⚔️ {{ result.eventDesc }}</text>
          <text class="br-row-val damage">-{{ result.damage }}</text>
        </view>
        <view v-else-if="result.statGain > 0" class="br-row anim" style="--i: 0">
          <text>{{ result.eventDesc }}</text>
          <text class="br-row-val stat">{{ result.statName }} +{{ result.statGain }}</text>
        </view>
        <view class="br-row anim" style="--i: 1">
          <text>✨ 经验</text>
          <text class="br-row-val">+{{ result.expGained }}</text>
        </view>
        <view v-if="result.levelUp" class="br-row anim levelup" style="--i: 2">
          <text>🎉 升级！</text>
          <text class="br-row-val">Lv.{{ result.level }}</text>
        </view>
        <view class="br-row anim" style="--i: 3">
          <text>🪙 喵币</text>
          <text class="br-row-val coin">+{{ result.pointsEarned }}</text>
        </view>
        <view class="br-row anim" style="--i: 4">
          <text>🔥 全勤连击</text>
          <text class="br-row-val streak">{{ result.currentStreak }} 天</text>
        </view>
      </view>

      <!-- 猫口吻鼓励语 -->
      <view class="br-bubble anim" style="--i: 5">
        <text>「{{ result.encouragement }}」</text>
      </view>

      <button class="pixel-btn br-close" @tap="close">收 下</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CheckInResultVO } from '@/types/api'
import { bossSprite, pixelCat } from '@/constants/pixel'

const props = defineProps<{
  visible: boolean
  result: CheckInResultVO | null
  /** 打卡前 BOSS 等级（用于选取像素 BOSS 形象），被击败后自动切到下一任形象 */
  bossLevel?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'settled'): void
}>()

const attacking = ref(false)
let attackTimer: ReturnType<typeof setTimeout> | null = null

const catSrc = computed(() => pixelCat(0, 'attack'))
const bossSrc = computed(() =>
  bossSprite(props.result?.bossDefeated && props.result.newBossLevel ? props.result.newBossLevel : props.bossLevel ?? 1)
)

const eventTitle = computed(() => {
  const r = props.result
  if (!r) return ''
  if (r.bossDefeated) return '⚡ 击败 BOSS！'
  if ((r.eventType || '').toLowerCase() === 'crit') return '💥 暴击！'
  if (r.damage > 0) return '⚔️ 会心一击'
  if ((r.statGain ?? 0) > 0) return '🌱 属性成长'
  return '📮 打卡成功'
})

const hpPercent = computed(() => {
  const r = props.result
  if (!r || r.bossHpBefore <= 0) return 0
  return Math.max(0, Math.round((r.bossHpAfter / r.bossHpBefore) * 100))
})

watch(
  () => props.visible,
  (v) => {
    if (v) {
      attacking.value = false
      if (attackTimer) clearTimeout(attackTimer)
      attackTimer = setTimeout(() => {
        attacking.value = true
      }, 350)
      emit('settled')
    }
  }
)

function handleTap() {
  // 点遮罩快速收起
  close()
}

function close() {
  emit('close')
}
</script>

<style lang="scss" scoped>
.br-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: $uni-bg-color-mask;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.br-panel {
  @include pixel-card($pixel-card);
  width: 100%;
  max-height: 82vh;
  overflow-y: auto;
  padding: 32rpx;
}

.br-head {
  text-align: center;
  margin-bottom: 24rpx;

  .br-event {
    display: block;
    font-size: 40rpx;
    font-weight: 800;
    letter-spacing: 4rpx;
    color: $pixel-primary-dark;
    animation: br-pop 0.4s steps(4);
  }

  .br-date {
    display: block;
    margin-top: 8rpx;
    @include pixel-title;
    font-size: 22rpx;
    color: $pixel-ink-light;
  }
}

.br-stage {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: $pixel-card-alt;
  border: 3rpx solid $pixel-ink;
  padding: 24rpx 12rpx 12rpx;
  margin-bottom: 20rpx;
}

.br-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .br-cat {
    width: 140rpx;
    height: 140rpx;
  }

  .br-boss {
    width: 120rpx;
    height: 120rpx;
  }

  .br-boss-wrap {
    position: relative;

    .is-defeated {
      animation: br-die 0.8s steps(4) forwards;
    }

    .br-ko {
      position: absolute;
      top: -10rpx;
      left: 50%;
      transform: translateX(-50%);
      font-size: 26rpx;
      font-weight: 800;
      color: $pixel-red;
      animation: br-pop 0.4s steps(4);
    }
  }

  .br-side-name {
    font-size: 20rpx;
    font-weight: 700;
    color: $pixel-ink;
    max-width: 200rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.br-vs {
  font-size: 32rpx;
  font-weight: 800;
  color: $pixel-red;
  letter-spacing: 2rpx;
}

.is-attacking {
  animation: br-lunge 0.7s steps(6);
}

.br-hp {
  margin-bottom: 20rpx;

  .br-hp-label {
    font-size: 20rpx;
    font-weight: 800;
    color: $pixel-ink-light;
  }

  .br-hp-num {
    font-size: 20rpx;
    font-weight: 800;
    color: $pixel-ink;
  }

  .br-hp-bar {
    margin-top: 8rpx;

    .br-hp-fill {
      display: block;
      background: $pixel-red;
    }
  }
}

.br-rows {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.br-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $pixel-card-alt;
  border: 3rpx solid $pixel-ink;
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: $pixel-ink;

  .br-row-val {
    font-weight: 800;

    &.damage {
      color: $pixel-red;
    }
    &.stat {
      color: $pixel-blue;
    }
    &.coin {
      color: $pixel-primary-dark;
    }
    &.streak {
      color: $pixel-green-dark;
    }
  }

  &.levelup {
    background: $pixel-yellow;
  }
}

.br-bubble {
  background: #fff;
  border: 3rpx solid $pixel-ink;
  padding: 16rpx 20rpx;
  font-size: 24rpx;
  color: $pixel-ink;
  margin-bottom: 24rpx;

  &::before {
    content: '🐱';
    margin-right: 8rpx;
  }
}

.br-close {
  width: 100%;
}

/* ===== 动画 ===== */
.anim {
  animation: br-rise 0.35s steps(4) backwards;
  animation-delay: calc(var(--i) * 0.22s + 0.2s);
}

@keyframes br-rise {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes br-pop {
  0% { transform: scale(0.3); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes br-lunge {
  0%, 100% { transform: translateX(0); }
  30% { transform: translateX(-24rpx); }
  55% { transform: translateX(48rpx) rotate(-8deg); }
  70% { transform: translateX(40rpx); }
}

@keyframes br-die {
  to {
    transform: rotate(90deg) translateY(30rpx);
    opacity: 0.25;
  }
}
</style>
