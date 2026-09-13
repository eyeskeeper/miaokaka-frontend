<template>
  <view class="cal">
    <!-- 月份切换 -->
    <view class="flex-between cal-head">
      <view class="cal-arrow" @tap="changeMonth(-1)">◀</view>
      <text class="cal-month">{{ year }}年{{ month }}月</text>
      <view class="cal-arrow" :class="{ 'is-hidden': isCurrentMonth }" @tap="changeMonth(1)">▶</view>
    </view>

    <!-- 星期行 -->
    <view class="cal-grid cal-week">
      <text v-for="w in weekLabels" :key="w" class="cal-week-cell">{{ w }}</text>
    </view>

    <!-- 日期网格 -->
    <view class="cal-grid">
      <view v-for="(cell, i) in cells" :key="i" class="cal-cell-wrap">
        <view v-if="cell.date" class="cal-cell" :class="cellClass(cell)" @tap="onTap(cell)">
          <text class="cal-day">{{ dayOf(cell.date) }}</text>
          <view v-if="cell.status === DAY_STATUS.checked" class="cal-dot checked" />
          <view v-else-if="cell.status === DAY_STATUS.makeup" class="cal-dot makeup" />
          <view v-else-if="cell.status === DAY_STATUS.pending" class="cal-dot pending" />
          <view v-else-if="cell.status === DAY_STATUS.abnormal" class="cal-dot abnormal" />
        </view>
      </view>
    </view>

    <!-- 图例 -->
    <view class="cal-legend">
      <view class="cal-legend-item"><view class="cal-dot checked" /><text>已打卡</text></view>
      <view class="cal-legend-item"><view class="cal-dot makeup" /><text>补卡</text></view>
      <view class="cal-legend-item"><view class="cal-dot makeupable" /><text>可补卡</text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getCheckinCalendar } from '@/api/checkin'
import { DAY_STATUS } from '@/constants/pixel'
import type { DayRecord } from '@/types/api'

const props = defineProps<{
  planId: number
}>()

const emit = defineEmits<{
  /** 点了可补卡的日期 */
  (e: 'makeupTap', date: string): void
}>()

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1) // 1-12
const records = ref<Map<string, DayRecord>>(new Map())

const todayStr = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

/** 30 天前（补卡边界） */
const makeupEarliest = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

const monthStr = computed(
  () => `${year.value}-${String(month.value).padStart(2, '0')}`
)

const isCurrentMonth = computed(
  () => year.value === now.getFullYear() && month.value === now.getMonth() + 1
)

interface Cell {
  date: string
  status: number
  isToday: boolean
  isFuture: boolean
  makeupable: boolean
}

const cells = computed<Cell[]>(() => {
  const first = new Date(year.value, month.value - 1, 1)
  const daysInMonth = new Date(year.value, month.value, 0).getDate()
  const lead = first.getDay()
  const list: Cell[] = []
  for (let i = 0; i < lead; i++) list.push({ date: '', status: 0, isToday: false, isFuture: false, makeupable: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${monthStr.value}-${String(d).padStart(2, '0')}`
    const rec = records.value.get(date)
    const isFuture = date > todayStr
    list.push({
      date,
      status: rec ? rec.status : -1,
      isToday: date === todayStr,
      isFuture,
      // 补卡条件：过去 30 天内、无打卡记录的日子
      makeupable:
        !isFuture && date >= makeupEarliest && date < todayStr && !rec
    })
  }
  return list
})

const dayOf = (date: string) => Number(date.slice(8, 10))

const cellClass = (cell: Cell) => ({
  'is-today': cell.isToday,
  'is-checked': cell.status === DAY_STATUS.checked || cell.status === DAY_STATUS.makeup,
  'is-makeup': cell.status === DAY_STATUS.makeup,
  'is-pending': cell.status === DAY_STATUS.pending,
  'is-abnormal': cell.status === DAY_STATUS.abnormal,
  'is-future': cell.isFuture,
  'is-makeupable': cell.makeupable
})

async function load() {
  if (!props.planId) return
  const data = await getCheckinCalendar(props.planId, monthStr.value)
  const map = new Map<string, DayRecord>()
  for (const rec of data.days || []) map.set(rec.date, rec)
  records.value = map
}

function changeMonth(delta: number) {
  if (delta > 0 && isCurrentMonth.value) return
  let m = month.value + delta
  let y = year.value
  if (m > 12) { m = 1; y++ }
  if (m < 1) { m = 12; y-- }
  year.value = y
  month.value = m
}

function onTap(cell: Cell) {
  if (cell.makeupable) emit('makeupTap', cell.date)
}

watch([year, month], load)
watch(() => props.planId, load)
onMounted(load)

defineExpose({ reload: load })
</script>

<style lang="scss" scoped>
.cal-head {
  margin-bottom: 16rpx;
}

.cal-arrow {
  @include pixel-btn($pixel-card-alt, $pixel-ink);
  width: 64rpx;
  height: 64rpx;
  font-size: 24rpx;

  &.is-hidden {
    opacity: 0.3;
  }
}

.cal-month {
  @include pixel-title;
  font-size: 30rpx;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6rpx;
}

.cal-week-cell {
  text-align: center;
  font-size: 20rpx;
  font-weight: 800;
  color: $pixel-ink-light;
  padding: 6rpx 0;
}

.cal-cell-wrap {
  aspect-ratio: 1;
}

.cal-cell {
  @include pixel-card($pixel-card);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  border-width: 2rpx;
  box-shadow: none;

  .cal-day {
    font-size: 24rpx;
    font-weight: 700;
    color: $pixel-ink;
  }

  &.is-today {
    background: $pixel-yellow;
  }

  &.is-checked {
    background: $pixel-green;

    .cal-day {
      color: #fff;
    }
  }

  &.is-makeup {
    background: $pixel-primary;

    .cal-day {
      color: #fff;
    }
  }

  &.is-pending {
    background: $pixel-blue;

    .cal-day {
      color: #fff;
    }
  }

  &.is-abnormal {
    background: $pixel-red;

    .cal-day {
      color: #fff;
    }
  }

  &.is-future {
    opacity: 0.4;
  }

  &.is-makeupable {
    border: 3rpx dashed $pixel-primary;

    .cal-day {
      color: $pixel-primary-dark;
    }
  }
}

.cal-dot {
  width: 12rpx;
  height: 12rpx;

  &.checked {
    background: #fff;
  }
  &.makeup {
    background: #fff;
  }
  &.makeupable {
    background: $pixel-primary;
  }
}

.cal-legend {
  display: flex;
  gap: 24rpx;
  margin-top: 16rpx;

  .cal-legend-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 20rpx;
    color: $pixel-ink-light;
  }
}
</style>
