<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
/* 引入 uView-Plus 全局样式 */
@import 'uview-plus/index.scss';

/* 引入主题变量 */
@import '@/uni.scss';

page {
  background-color: #f5f5f5;
}
</style>
