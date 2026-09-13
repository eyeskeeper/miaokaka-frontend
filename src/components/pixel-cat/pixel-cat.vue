<template>
  <image
    class="pixel-cat-img pixelated"
    :class="[`pose-${pose}`]"
    :src="src"
    mode="aspectFit"
    :style="{ width: size + 'rpx', height: size + 'rpx' }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { pixelCat, type CatPose } from '@/constants/pixel'

const props = withDefaults(defineProps<{
  catType?: number
  pose?: CatPose
  /** rpx 尺寸 */
  size?: number
}>(), {
  catType: 0,
  pose: 'idle',
  size: 160
})

const src = computed(() => pixelCat(props.catType, props.pose))
</script>

<style lang="scss" scoped>
.pixel-cat-img {
  flex-shrink: 0;
}

.pose-idle {
  animation: cat-bob 2.4s steps(2) infinite;
}

.pose-happy {
  animation: cat-jump 0.5s steps(2) infinite;
}

@keyframes cat-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6rpx); }
}

@keyframes cat-jump {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-14rpx) scale(1.04); }
}
</style>
