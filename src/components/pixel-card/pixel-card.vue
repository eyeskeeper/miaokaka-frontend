<template>
  <view class="pc-card" :style="{ padding: noPadding ? '0' : '24rpx' }">
    <view v-if="title" class="pc-title">{{ title }}</view>
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** 顶部像素标题条 */
  title?: string
  /** 去掉内边距 */
  noPadding?: boolean
}>(), {
  title: '',
  noPadding: false
})
</script>

<style lang="scss" scoped>
.pc-card {
  @include pixel-card;
}

.pc-title {
  @include pixel-title;
  font-size: 30rpx;
  margin-bottom: 20rpx;

  &::before {
    content: '▚ ';
    color: $pixel-primary;
  }
}
</style>
