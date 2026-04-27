<template>
  <view class="checkin-detail-container">
    <!-- 统计概览 -->
    <view class="stats-card">
      <view class="stat-row">
        <view class="stat-item">
          <text class="stat-value">{{ totalCheckIns }}</text>
          <text class="stat-label">累计打卡</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ currentMonthCount }}</text>
          <text class="stat-label">本月打卡</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ currentStreak }}</text>
          <text class="stat-label">连续天数</text>
        </view>
      </view>
    </view>

    <!-- 日历月份切换 -->
    <view class="calendar-header">
      <view class="month-btn" @click="prevMonth">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <text class="month-title">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
      <view class="month-btn" @click="nextMonth">
        <u-icon name="arrow-right" color="#333" size="20"></u-icon>
      </view>
    </view>

    <!-- 日历组件 -->
    <view class="calendar-card">
      <!-- 星期头 -->
      <view class="weekdays">
        <text v-for="day in weekdays" :key="day" class="weekday">{{ day }}</text>
      </view>

      <!-- 日期网格 -->
      <view class="calendar-grid">
        <view
          v-for="(date, index) in calendarDates"
          :key="index"
          class="calendar-cell"
          :class="{
            'empty': !date,
            'today': isToday(date),
            'has-checkin': hasCheckIn(date),
            'selected': isSelectedDate(date)
          }"
          @click="selectDate(date)"
        >
          <text v-if="date" class="date-number">{{ date.getDate() }}</text>
          <view v-if="hasCheckIn(date)" class="checkin-dot"></view>
        </view>
      </view>
    </view>

    <!-- 选中日期的打卡详情 -->
    <view v-if="selectedDate && getCheckInDetails(selectedDate).length > 0" class="detail-card">
      <view class="detail-header">
        <text class="detail-title">{{ formatSelectedDate }}打卡记录</text>
      </view>
      <view class="detail-list">
        <view
          v-for="item in getCheckInDetails(selectedDate)"
          :key="item.id"
          class="detail-item"
        >
          <view class="item-left">
            <u-icon name="checkbox-mark" color="#7CB342" size="20"></u-icon>
            <text class="item-title">{{ item.title }}</text>
          </view>
          <text class="item-time">{{ item.time }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="selectedDate" class="empty-detail">
      <u-icon name="clock" color="#ddd" size="60"></u-icon>
      <text class="empty-text">该日期无打卡记录</text>
    </view>

    <!-- 连续打卡提示 -->
    <view v-if="currentStreak > 0" class="streak-tip">
      <u-icon name="star" color="#FFEB3B" size="18"></u-icon>
      <text class="streak-text">已连续打卡 {{ currentStreak }} 天，继续加油！</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storage } from '@/utils/storage'

// ===== 类型定义 =====
interface CheckInRecord {
  date: string        // YYYY-MM-DD 格式
  time: string        // HH:mm 格式
  planId: string
  title: string
  points: number
}

// ===== 状态 =====
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref<Date | null>(null)
const checkInRecords = ref<CheckInRecord[]>([])

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// ===== 计算属性 =====

// 获取当前月份的所有日期（包括前后月的空白）
const calendarDates = computed(() => {
  const dates: (Date | null)[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  // 填充月初空白
  for (let i = 0; i < startDayOfWeek; i++) {
    dates.push(null)
  }

  // 填充当月日期
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(currentYear.value, currentMonth.value, i))
  }

  return dates
})

// 格式化选中日期
const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const month = selectedDate.value.getMonth() + 1
  const day = selectedDate.value.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[selectedDate.value.getDay()]
  return `${month}月${day}日（周${weekday}）`
})

// 累计打卡次数
const totalCheckIns = computed(() => {
  const uniqueDates = new Set(checkInRecords.value.map(r => r.date))
  return uniqueDates.size
})

// 本月打卡次数
const currentMonthCount = computed(() => {
  const monthPrefix = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`
  const uniqueDates = new Set(
    checkInRecords.value
      .filter(r => r.date.startsWith(monthPrefix))
      .map(r => r.date)
  )
  return uniqueDates.size
})

// 连续打卡天数
const currentStreak = computed(() => {
  if (checkInRecords.value.length === 0) return 0

  const uniqueDates = Array.from(new Set(checkInRecords.value.map(r => r.date))).sort().reverse()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // 检查今天或昨天是否有打卡
  const todayStr = formatDateKey(today)
  const yesterdayStr = formatDateKey(yesterday)
  const hasRecentCheckIn = uniqueDates.some(d => d === todayStr || d === yesterdayStr)

  if (!hasRecentCheckIn) return 0

  let streak = 0
  let checkDate = new Date(today)

  // 如果今天没有打卡，从昨天开始计算
  if (!uniqueDates.includes(todayStr)) {
    checkDate = yesterday
  }

  while (true) {
    const dateKey = formatDateKey(checkDate)
    if (uniqueDates.includes(dateKey)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
})

// ===== 方法 =====

// 上个月
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// 下个月
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 判断是否是今天
const isToday = (date: Date | null): boolean => {
  if (!date) return false
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// 判断是否有打卡记录
const hasCheckIn = (date: Date | null): boolean => {
  if (!date) return false
  const dateKey = formatDateKey(date)
  return checkInRecords.value.some(r => r.date === dateKey)
}

// 判断是否是选中日期
const isSelectedDate = (date: Date | null): boolean => {
  if (!date || !selectedDate.value) return false
  return formatDateKey(date) === formatDateKey(selectedDate.value)
}

// 格式化日期为 YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 选择日期
const selectDate = (date: Date | null) => {
  if (date) {
    selectedDate.value = date
  }
}

// 获取指定日期的打卡详情
const getCheckInDetails = (date: Date | null) => {
  if (!date) return []
  const dateKey = formatDateKey(date)
  return checkInRecords.value.filter(r => r.date === dateKey)
}

// ===== API 调用 =====
// 预留的 API 接口调用位置
const fetchCheckInRecords = async () => {
  // TODO: 替换为实际的 API 调用
  // 示例:
  // const response = await uni.request({
  //   url: '/api/checkin/history',
  //   method: 'GET'
  // })
  // checkInRecords.value = response.data

  // 临时使用模拟数据
  loadMockData()
}

// 模拟数据加载（实际使用时删除）
const loadMockData = () => {
  const today = new Date()
  const mockRecords: CheckInRecord[] = []

  // 生成过去30天的随机打卡记录
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = formatDateKey(date)

    // 80% 的概率有打卡记录
    if (Math.random() > 0.2) {
      const checkInCount = Math.floor(Math.random() * 3) + 1 // 每天打卡1-3次
      for (let j = 0; j < checkInCount; j++) {
        const hour = 6 + Math.floor(Math.random() * 14) // 6:00-20:00
        const minute = Math.floor(Math.random() * 60)
        mockRecords.push({
          date: dateKey,
          time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          planId: `plan_${i}_${j}`,
          title: ['晨跑打卡', '阅读30分钟', '喝水8杯', '早睡早起', '健身锻炼'][j % 5],
          points: 10
        })
      }
    }
  }

  checkInRecords.value = mockRecords
}

// ===== 生命周期 =====
onMounted(() => {
  // 加载打卡记录
  const savedRecords = storage.get<CheckInRecord[]>('checkInRecords')
  if (savedRecords) {
    checkInRecords.value = savedRecords
  } else {
    // 加载模拟数据
    loadMockData()
  }

  // 选中今天
  selectedDate.value = new Date()
})
</script>

<style lang="scss" scoped>
.checkin-detail-container {
  min-height: 100vh;
  background: #F9FBE7;
  padding-bottom: 40rpx;
}

// 统计卡片
.stats-card {
  background: linear-gradient(135deg, #CDDC39 0%, #8BC34A 100%);
  margin: 20rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  color: #fff;

  .stat-row {
    display: flex;
    justify-content: space-around;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: 48rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }
}

// 日历头部
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20rpx;
  gap: 40rpx;

  .month-btn {
    width: 60rpx;
    height: 60rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }

  .month-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

// 日历卡片
.calendar-card {
  background: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 20rpx;

    .weekday {
      text-align: center;
      font-size: 26rpx;
      color: #999;
      padding: 10rpx 0;
    }
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8rpx;

    .calendar-cell {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      position: relative;
      transition: all 0.2s;

      .date-number {
        font-size: 28rpx;
        color: #333;
      }

      .checkin-dot {
        width: 12rpx;
        height: 12rpx;
        background: #AED581;
        border-radius: 50%;
        margin-top: 4rpx;
      }

      &.empty {
        background: transparent;
      }

      &.today {
        background: #F0F4C3;

        .date-number {
          font-weight: bold;
          color: #7CB342;
        }
      }

      &.has-checkin {
        .date-number {
          color: #7CB342;
          font-weight: 500;
        }
      }

      &.selected {
        background: #AED581;

        .date-number {
          color: #fff;
          font-weight: bold;
        }

        .checkin-dot {
          background: #fff;
        }
      }
    }
  }
}

// 详情卡片
.detail-card {
  background: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .detail-header {
    margin-bottom: 20rpx;

    .detail-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .detail-list {
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .item-left {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .item-title {
          font-size: 28rpx;
          color: #333;
        }
      }

      .item-time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

// 空状态
.empty-detail {
  background: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 20rpx;
  padding: 60rpx 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .empty-text {
    display: block;
    font-size: 26rpx;
    color: #999;
    margin-top: 20rpx;
  }
}

// 连续打卡提示
.streak-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin: 0 20rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .streak-text {
    font-size: 26rpx;
    color: #666;
  }
}
</style>
