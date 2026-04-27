# Design System Rules for Figma Integration

This document provides comprehensive guidelines for integrating Figma designs into this uni-app project.

---

## Project Overview

**Framework**: uni-app (Vue 3 + TypeScript)
**Build System**: Vite
**UI Library**: uView-Plus v3.7.36
**State Management**: Pinia
**Styling**: SCSS with design tokens

---

## 1. Token Definitions

### Location: `src/uni.scss`

Design tokens are defined as SCSS variables at the root level and are globally available throughout the project.

### Color System - Yellow-Green Theme

```scss
/* Primary Action Colors */
$uni-color-primary: #AED581;    // Light Green
$uni-color-success: #7CB342;    // Medium Green
$uni-color-warning: #CDDC39;    // Yellow-Lime
$uni-color-error: #FF6F00;       // Orange-Red

/* uView-Plus Theme Colors */
$u-primary: #AED581;
$u-success: #7CB342;
$u-warning: #CDDC39;
$u-error: #FF6F00;
$u-info: #9E9D24;

/* Custom App Colors */
$cat-primary: #C0CA33;
$bg-page: #F9FBE7;              // Light Lime Background
$bg-card: #ffffff;

/* Gradient Tokens */
$gradient-primary: linear-gradient(135deg, #CDDC39 0%, #8BC34A 100%);
$gradient-accent: linear-gradient(135deg, #FFEB3B 0%, #AED581 100%);
```

### Typography Scale

```scss
/* Font Sizes (in px) */
$uni-font-size-sm: 12px;         // 24rpx
$uni-font-size-base: 14px;        // 28rpx
$uni-font-size-lg: 16;           // 32rpx

/* Contextual Typography */
$uni-font-size-title: 20px;       // 40rpx
$uni-font-size-subtitle: 18px;     // 36rpx
$uni-font-size-paragraph: 15px;    // 30rpx
```

**Note**: The project uses `rpx` (responsive pixels) for sizing. 1rpx = 0.5px on most devices. Convert pixels to rpx by multiplying by 2.

### Spacing Scale

```scss
/* Horizontal Spacing */
$uni-spacing-row-sm: 5px;       // 10rpx
$uni-spacing-row-base: 10px;     // 20rpx
$uni-spacing-row-lg: 15px;        // 30rpx

/* Vertical Spacing */
$uni-spacing-col-sm: 4px;        // 8rpx
$uni-spacing-col-base: 8px;       // 16rpx
$uni-spacing-col-lg: 12px;        // 24rpx
```

### Border Radius

```scss
$uni-border-radius-sm: 2px;       // 4rpx
$uni-border-radius-base: 3px;     // 6rpx
$uni-border-radius-lg: 6px;       // 12rpx
$uni-border-radius-circle: 50%;
```

**Common Usage Patterns**:
- Cards: `20rpx` (10px)
- Buttons: `50%` (circle shape) or `10rpx`
- Inputs: `10rpx`

### Text Colors

```scss
$uni-text-color: #333;                // Primary text
$uni-text-color-inverse: #fff;         // White text on colored backgrounds
$uni-text-color-grey: #999;           // Secondary text
$uni-text-color-placeholder: #808080;  // Input placeholders
$uni-text-color-disable: #c0c0c0;    // Disabled state
```

### Background Colors

```scss
$uni-bg-color: #fff;
$uni-bg-color-grey: #F9FBE7;
$uni-bg-color-hover: #f1f1f1;
$uni-bg-color-mask: rgba(0, 0, 0, 0.4);
```

---

## 2. Component Library

### Primary UI Framework: uView-Plus

uView-Plus components are auto-imported via easycom configuration. Use components with the `u-` prefix.

### Available Components (from actual usage)

| Component | Usage Pattern |
|-----------|--------------|
| `u-avatar` | User avatars, cat avatars. Supports `size`, `shape` (circle/square) |
| `u-button` | Primary actions. Supports `type` (primary/info/error/warning), `shape` (circle), `size` |
| `u-card` | Card containers (not used directly, custom cards implemented) |
| `u-cell` | List items in profile/settings |
| `u-cell-group` | Groups of cells |
| `u-checkbox` | Form checkboxes |
| `u-divider` | Visual separators |
| `u-form` | Form containers with validation |
| `u-form-item` | Form field wrapper |
| `u-grid` | Grid layouts (4 columns typically) |
| `u-grid-item` | Grid item |
| `u-icon` | Icons. Built-in names: `home`, `clock`, `heart`, `list`, `account`, `pets`, `integral`, `star`, `arrow-right`, `checkmark-circle`, `file-text`, `edit-pen`, `setting`, `info-circle`, `question-circle`, `error-circle`, `man-add`, `zap`, `lock`, `phone`, `plus`, `close` |
| `u-image` | Image display with loading states |
| `u-input` | Text inputs with prefix icons |
| `u-line-progress` | Progress bars for level/exp |
| `u-loadmore` | Infinite scroll loading indicator |
| `u-popup` | Bottom sheet modals |
| `u-progress` | Boss HP progress bars |
| `u-radio` | Radio buttons (cat colors, styles) |
| `u-radio-group` | Radio button container |
| `u-tag` | Small labels (status, mini badges) |
| `u-timeline` | Vertical timeline for history |
| `u-timeline-item` | Timeline item |
| `u-textarea` | Multi-line text input |

### Custom Components (to be created)

Currently, custom components are implemented directly in pages. Consider extracting reusable components:
- UserCard
- CatCard
- StatsCard
- PlanItem
- BossItem
- AttributeItem

### Component Naming Convention

- uView components: `u-{ComponentName}` (kebab-case)
- Custom components: PascalCase
- Pages: kebab-case in path, PascalCase in file

---

## 3. Frameworks & Libraries

### Core Stack

**Framework**: uni-app 3.x (Vue 3 Composition API + TypeScript)
**UI Library**: uView-Plus 3.7.36
**State Management**: Pinia 3.0.4
**Build Tool**: Vite 5.2.8
**Styling**: SCSS (Sass 1.99.0)

### Key Dependencies

```json
{
  "dependencies": {
    "@dcloudio/uni-app": "3.0.0-4080420251103001",
    "pinia": "^3.0.4",
    "uview-plus": "^3.7.36",
    "vue": "^3.4.21",
    "vue-i18n": "^9.1.9"
  }
}
```

### Build Configuration

**Vite Config** (`vite.config.ts`):
- Uses `@dcloudio/vite-plugin-uni` for uni-app compilation
- Alias: `'uview-plus': 'uview-plus'`

### Multi-Platform Support

uni-app supports:
- H5 (web)
- WeChat Mini Program
- Multiple other mini-programs (Alipay, Baidu, QQ, etc.)
- HarmonyOS
- Quick App

**Important**: When implementing Figma designs, ensure compatibility across platforms. Use `rpx` for responsive sizing and avoid platform-specific APIs.

---

## 4. Asset Management

### Asset Locations

Static assets are stored in the `static/` directory:
```
static/
├── logo.png
├── tabbar/
│   ├── home.png
│   ├── home-active.png
│   ├── cat.png
│   ├── cat-active.png
│   ├── rank.png
│   ├── rank-active.png
│   ├── user.png
│   └── user-active.png
```

### Asset References

**Local Assets**:
```vue
<image src="/static/logo.png" />
<!-- or -->
<u-image src="/static/logo.png" />
```

**Remote Assets**:
```vue
<!-- Used for cat avatars (placeholder images) -->
<u-avatar :src="https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png" />
```

**Dynamic Asset Mapping**:
```typescript
const getCatAvatar = (color: string) => {
  const colorMap: Record<string, string> = {
    orange: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png',
    white: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png',
    black: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png',
    gray: 'https://web-assets.dcloud.io/unidoc/zh/uni-app/uni-quickstart.png'
  }
  return colorMap[color] || colorMap.orange
}
```

### Tab Bar Icons

Tab bar icons are defined in `pages.json` with both default and active states.

### CDN Configuration

Currently using external URLs for placeholder images. No CDN configuration present.

---

## 5. Icon System

### Icon Library: uView-Plus Built-in Icons

Icons are referenced by name using the `u-icon` component.

### Common Icon Names Used

```vue
<!-- Navigation/Actions -->
<u-icon name="arrow-right" />
<u-icon name="close" />
<u-icon name="plus" />

<!-- Status/Feedback -->
<u-icon name="checkbox-mark" />
<u-icon name="checkmark-circle" />
<u-icon name="error-circle" />

<!-- User/Profile -->
<u-icon name="account" />
<u-icon name="edit-pen" />
<u-icon name="avatar" />

<!-- Pets/Game -->
<u-icon name="pets" />
<u-icon name="star" />

<!-- Time/History -->
<u-icon name="clock" />

<!-- Actions -->
<u-icon name="heart" />
<u-icon name="list" />
<u-icon name="integral" />
<u-icon name="setting" />
<u-icon name="info-circle" />
<u-icon name="question-circle" />

<!-- Form -->
<u-icon name="lock" />
<u-icon name="phone" />

<!-- Attributes -->
<u-icon name="man-add" />   <!-- Strength -->
<u-icon name="zap" />      <!-- Agility -->
```

### Icon Customization

```vue
<!-- Size in px -->
<u-icon name="star" color="#FFEB3B" size="24" />
<u-icon name="integral" color="#AED581" size="40" />
```

### Icon Naming Convention

Use descriptive English names matching uView-Plus icon set. Refer to uView-Plus documentation for available icons.

---

## 6. Styling Approach

### CSS Methodology: Scoped SCSS

All Vue components use scoped SCSS with global design tokens.

### Global Styles: `src/App.vue`

```vue
<style lang="scss">
/* Import uView-Plus global styles */
@import 'uview-plus/index.scss';

/* Import theme variables */
@import '@/uni.scss';

page {
  background-color: #f5f5f5;
}
</style>
```

### Component Styling Pattern

```vue
<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F9FBE7;
  padding-bottom: 20rpx;

  .child-element {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }
}
</style>
```

### Common Layout Patterns

**Flex Layout**:
```scss
.section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
}
```

**Card Pattern**:
```scss
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
```

**Gradient Card**:
```scss
.gradient-card {
  background: linear-gradient(135deg, #CDDC39 0%, #8BC34A 100%);
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  color: #fff;
}
```

**Section Header Pattern**:
```scss
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}
```

**Empty State Pattern**:
```scss
.empty-state {
  text-align: center;
  padding: 80rpx 0;

  .empty-text {
    display: block;
    font-size: 26rpx;
    color: #999;
    margin-top: 20rpx;
  }
}
```

### Interactive States

```scss
.button {
  transition: all 0.3s;

  &:active {
    background: #f5f5f5;
  }
}

.item {
  &.checked {
    background: #7CB342;
    color: #fff;
  }
}
```

### Shadow Scale

```scss
/* Light shadow for cards */
box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

/* Medium shadow */
box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);

/* Badge shadow */
box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
```

### Responsive Design

**Use rpx for all dimensions**:
- `rpx` scales based on screen width (750rpx = screen width)
- For web H5: 1rpx = 0.5px (typically)
- For mini-programs: Automatic scaling

**Font Size Mapping** (px → rpx):
- 12px → 24rpx
- 14px → 28rpx
- 16px → 32rpx
- 20px → 40rpx

---

## 7. Project Structure

```
src/
├── App.vue                    # Root component with global styles
├── main.ts                   # App entry point
├── uni.scss                  # Global design tokens (SCSS variables)
├── pages.json                # Page configuration, tabBar, routes
├── pages/
│   ├── index/                # Home page (dashboard)
│   │   └── index.vue
│   ├── login/                # Login page
│   │   └── login.vue
│   ├── cat/                 # Cat management
│   │   ├── cat.vue          # Cat list
│   │   └── catDetail.vue    # Cat detail
│   ├── checkin/             # Check-in feature
│   │   └── checkin.vue
│   ├── ranking/             # Leaderboard
│   │   └── ranking.vue
│   └── profile/             # User profile
│       └── profile.vue
├── stores/                 # Pinia stores
│   ├── user.ts             # User state
│   ├── cat.ts             # Cat game state
│   ├── plan.ts            # Daily plans
│   └── ranking.ts         # Leaderboard state
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utilities
│   ├── storage.ts         # Local storage wrapper
│   └── format.ts         # Date/number formatting
└── static/               # Static assets
    ├── logo.png
    └── tabbar/
```

### Feature Organization

Each feature has:
- **Pages**: In `src/pages/{feature}/`
- **Store**: In `src/stores/{feature}.ts`
- **Types**: In `src/types/index.ts` (shared)
- **Utils**: In `src/utils/` (shared)

### Page Configuration

Pages are registered in `pages.json`:

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tabbar/home.png",
        "selectedIconPath": "static/tabbar/home-active.png"
      }
    ]
  }
}
```

### Store Pattern

```typescript
// src/stores/{feature}.ts
import { defineStore } from 'pinia'

export interface FeatureItem {
  id: string
  name: string
  // ...
}

export const useFeatureStore = defineStore('feature', {
  state: () => ({
    items: [] as FeatureItem[],
    currentId: ''
  }),
  getters: {
    currentItem: (state) => {
      return state.items.find(i => i.id === state.currentId)
    }
  },
  actions: {
    addItem(item: FeatureItem) {
      this.items.push(item)
    },
    // ...
  }
})
```

### Utility Pattern

```typescript
// src/utils/format.ts
export const formatDate = (date: string | Date) => {
  // formatting logic
}

// src/utils/storage.ts
export const storage = {
  set(key: string, value: any) {
    uni.setStorageSync(key, JSON.stringify(value))
  },
  get<T>(key: string): T | null {
    // ...
  }
}
```

---

## 8. Figma to Code Mapping

### Color Mapping

When translating Figma colors to code:

| Figma Usage | Code Equivalent |
|-------------|----------------|
| Primary buttons | `$u-primary: #AED581` |
| Success states | `$u-success: #7CB342` |
| Warning states | `$u-warning: #CDDC39` |
| Error states | `$u-error: #FF6F00` |
| Background | `$bg-page: #F9FBE7` |
| Cards | `$bg-card: #ffffff` |
| Primary text | `$uni-text-color: #333` |
| Secondary text | `$uni-text-color-grey: #999` |

### Component Mapping

| Figma Component | Code Component |
|----------------|----------------|
| Primary Button | `<u-button type="primary" shape="circle">` |
| Secondary Button | `<u-button type="info">` |
| Destructive Button | `<u-button type="error">` |
| Card | Custom card with `.card` class |
| List Item | `<u-cell>` or custom `.item` |
| Avatar | `<u-avatar>` |
| Tag/Label | `<u-tag>` |
| Icon | `<u-icon>` |
| Input | `<u-input>` |
| Form | `<u-form>` |
| Modal | `<u-popup mode="bottom">` |
| Progress | `<u-line-progress>` or `<u-progress>` |
| Grid | `<u-grid :col="4">` |

### Typography Mapping

| Figma Style | Code Implementation |
|-------------|-------------------|
| H1 (40px) | `font-size: 40rpx; font-weight: bold;` |
| H2 (36px) | `font-size: 36rpx; font-weight: bold;` |
| H3 (32px) | `font-size: 32rpx; font-weight: bold;` |
| Body (28px) | `font-size: 28rpx;` |
| Caption (24px) | `font-size: 24rpx; color: #999;` |

### Spacing Conversion

**Formula**: Figma px × 2 = code rpx

| Figma | Code (rpx) |
|-------|-------------|
| 4px | 8rpx |
| 8px | 16rpx |
| 10px | 20rpx |
| 12px | 24rpx |
| 15px | 30rpx |
| 20px | 40rpx |
| 30px | 60rpx |

### Common Patterns

**Gradient Card with Stats**:
```vue
<view class="stats-card">
  <!-- Content -->
</view>
```
```scss
.stats-card {
  background: linear-gradient(135deg, #CDDC39 0%, #8BC34A 100%);
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  color: #fff;
}
```

**List Item with Left Icon**:
```vue
<view class="list-item">
  <u-icon name="pets" color="#AED581" size="24" />
  <view class="item-content">...</view>
  <u-icon name="arrow-right" />
</view>
```

**Section with Add Button**:
```vue
<view class="section">
  <view class="section-header">
    <text class="section-title">Title</text>
    <view class="add-btn" @click="...">
      <u-icon name="plus" color="#fff" />
    </view>
  </view>
</view>
```

---

## 9. Guidelines for Figma Design

### Do's

- Use the Yellow-Green color palette (#AED581, #CDDC39, #7CB342, #FF6F00)
- Design with mobile-first approach (375px-430px width)
- Use 20rpx border radius for cards
- Include empty states for lists
- Use gradients for feature cards
- Include loading states
- Design with rpx-scale in mind (use even px values)
- Use uView-Plus icons when possible
- Include both light and dark interactions

### Don'ts

- Don't use arbitrary colors (stick to token system)
- Don't use px values directly (convert to rpx)
- Don't create custom components when uView-Plus provides one
- Don't use platform-specific features without fallback
- Don't ignore responsive behavior across mini-programs

### Accessibility

- Ensure text contrast (light text on dark backgrounds)
- Include tap targets minimum 44rpx × 44rpx
- Use semantic colors for status (success/warning/error)
- Provide clear visual feedback for all interactions

---

## 10. Implementation Checklist

When implementing Figma designs:

- [ ] Convert all px values to rpx (multiply by 2)
- [ ] Map colors to design tokens
- [ ] Use uView-Plus components where available
- [ ] Apply global border radius (20rpx for cards)
- [ ] Use gradients for feature cards
- [ ] Implement empty states
- [ ] Add loading states
- [ ] Include interaction feedback (active states)
- [ ] Test on H5 and at least one mini-program
- [ ] Verify responsive behavior
- [ ] Check accessibility (contrast, tap targets)
