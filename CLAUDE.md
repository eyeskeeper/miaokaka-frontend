# CLAUDE.md — 喵卡卡前端协作约定

打卡 + 猫咪养成（喵卡卡）uni-app 前端。**像素游戏风主题**，对接真实后端。

- 技术栈：uni-app 3 + Vue 3 + TypeScript + Pinia + uview-plus（easycom `u-` 前缀可用）
- 后端：`http://localhost:18089/api`，OpenAPI 文档 `/api/v3/api-docs`，接口类型见 `src/types/api.ts`
- 历次任务记录在 `docs/`（日期+任务命名），接手前先看最新一篇

## 像素主题（src/uni.scss，全局自动注入）

调色板一律用 `$pixel-*` 变量，不要硬编码颜色：

```scss
$pixel-bg: #F7EED3;        // 页面米黄底
$pixel-card: #FFFBEF;      // 卡片底
$pixel-card-alt: #F2E6C9;  // 内嵌块
$pixel-ink: #4A3728;       // 描边/正文
$pixel-ink-light: #9C8B7A; // 次要文字
$pixel-primary: #E8833A;   // 主操作（南瓜橙）
$pixel-green: #6ABE4E;     // 成功/连击
$pixel-yellow: #F7C948;    // 高亮/喵币
$pixel-red: #D95763;       // 危险
$pixel-blue: #5AA9E6;      // 信息
$pixel-purple: #9B7EDE;    // BOSS/点缀
```

可用 mixin（页面 scss 里直接 `@include`）：

- `pixel-card($bg, $bd, $shadow)` — 卡片：直角粗边 + 硬阴影
- `pixel-block($bg, $bd)` — 输入框/chip 等内嵌块：细边无阴影
- `pixel-btn($bg, $color, $bd)` — 按钮：按压缩位移；配套全局类 `.pixel-btn / .pixel-btn-sm(-green/-red)`
- `pixel-tag($bg, $color)` — 小标签
- `pixel-bar($fill, $track)` — 进度条（内部放 `.bar-fill`）
- `pixel-title` / `pixelated` — 标题字 / 像素图关闭抗锯齿（H5 必加，否则像素图发糊）

像素风规则：全部直角（radius 0）、阴影用硬投影（无 blur）、尺寸用 rpx、猫咪/BOSS/图标一律用 `src/static/pixel/` 的 PNG（改素材跑 `python scripts/gen_assets.py`，不要手改图片）。

## 组件约定

- **自定义组件（pixel-cat / pixel-card / battle-result / checkin-calendar）easycom 解析不可靠，必须页面内显式 import**（`import PixelCat from '@/components/pixel-cat/pixel-cat.vue'`）；模板里用 PascalCase 标签
- 像素图 `<image>` 记得加 `class="pixelated"`

## 重要须知

- **改 `uni.scss` 或 `pages.json` 后必须重启 dev server**（HMR 不覆盖全局注入与页面注册），页面级 .vue 改动可热更
- 网络请求走 `src/utils/request.ts`（自动带 Bearer、`code=0` 解包、40100 跳登录）；上传走 `src/utils/upload.ts`
- 后端契约细节与历史踩坑（枚举语义、任务位图兜底等）见 `docs/` 最新一篇

## 常用命令

```bash
npm run dev:h5      # H5 开发（后端 CORS 全开可直连）
npm run type-check  # vue-tsc，提交前必跑
```
