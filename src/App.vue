<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/user";
import { startPolling, stopPolling } from "@/utils/poll";

onLaunch(() => {
  const userStore = useUserStore();
  if (userStore.isLoggedIn) {
    userStore.fetchMe();
  }
});
onShow(() => {
  // 拍一拍气泡 + 通知角标轮询（未登录不启动）
  startPolling();
});
onHide(() => {
  stopPolling();
});
</script>

<style lang="scss">
/* 引入 uView-Plus 全局样式 */
@import "uview-plus/index.scss";

page {
  background-color: $pixel-bg;
  color: $pixel-ink;
  font-size: 28rpx;
}

/* ===== 像素风全局类 ===== */

// 像素卡片容器
.pixel-card {
  @include pixel-card;
  padding: 24rpx;
}

// 内嵌像素块
.pixel-block {
  background: $pixel-card-alt;
  border: 3rpx solid $pixel-ink;
  border-radius: 0;
}

// 主按钮
.pixel-btn {
  @include pixel-btn;
  height: 88rpx;
  padding: 0 40rpx;
  font-size: 30rpx;
}

.pixel-btn-green {
  @include pixel-btn($pixel-green);
  height: 88rpx;
  padding: 0 40rpx;
  font-size: 30rpx;
}

.pixel-btn-red {
  @include pixel-btn($pixel-red);
  height: 88rpx;
  padding: 0 40rpx;
  font-size: 30rpx;
}

// 小按钮
.pixel-btn-sm {
  @include pixel-btn($pixel-primary);
  height: 56rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
}

.pixel-btn-sm-green {
  @include pixel-btn($pixel-green);
  height: 56rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
}

// 像素标签
.pixel-tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 14rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: $pixel-ink;
  background: $pixel-card-alt;
  border: 3rpx solid $pixel-ink;
}

// 像素图片关闭抗锯齿
.pixelated {
  @include pixelated;
}

// 进度条
.pixel-progress {
  @include pixel-bar;
  height: 24rpx;

  > .bar-fill {
    display: block;
  }
}

// 标题
.pixel-h1 {
  @include pixel-title;
  font-size: 36rpx;
}

.pixel-h2 {
  @include pixel-title;
  font-size: 30rpx;
}

// 次要文字
.pixel-sub {
  color: $pixel-ink-light;
  font-size: 24rpx;
}

/* 弹性工具类 */
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-between {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.flex-1 {
  flex: 1;
  min-width: 0;
}
</style>
