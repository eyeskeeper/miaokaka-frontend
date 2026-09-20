<template>
  <view v-if="notifyStore.nudges.length" class="nudge-bubbles">
    <view
      v-for="n in notifyStore.nudges"
      :key="n.id"
      class="bubble pixel-card"
      @tap="notifyStore.dismiss(n.id)"
    >
      <image class="pixelated b-cat" src="/static/pixel/cat-orange-idle.png" />
      <view class="b-body">
        <text class="b-from">👋 {{ n.item.fromUserName }} 拍了拍你</text>
        <text class="b-text">{{ n.item.text }}</text>
      </view>
      <text class="b-close">✕</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notifyStore = useNotificationStore()

const sweeper = setInterval(() => notifyStore.sweep(), 1000)
onUnmounted(() => clearInterval(sweeper))
</script>

<style lang="scss" scoped>
.nudge-bubbles {
  position: fixed;
  top: 180rpx;
  left: 24rpx;
  right: 24rpx;
  z-index: 998;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  pointer-events: none;
}

.bubble {
  display: flex;
  align-items: center;
  gap: 14rpx;
  background: $pixel-yellow;
  box-shadow: 6rpx 6rpx 0 rgba(74, 55, 40, 0.35);
  pointer-events: auto;

  .b-cat {
    width: 56rpx;
    height: 56rpx;
    flex-shrink: 0;
  }

  .b-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .b-from {
    font-size: 24rpx;
    font-weight: 900;
    color: $pixel-ink;
  }

  .b-text {
    font-size: 24rpx;
    font-weight: 700;
    color: $pixel-primary-dark;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .b-close {
    font-size: 22rpx;
    color: $pixel-ink-light;
    padding: 8rpx;
  }
}
</style>
