import { getMyNudges } from '@/api/duel'
import { useNotificationStore } from '@/stores/notification'
import { getToken } from '@/utils/request'

const POLL_INTERVAL = 30_000
/** 首次 tick 延迟：等首屏页面与 tabBar 挂载完成（否则路由判断与角标设置都会落空） */
const FIRST_TICK_DELAY = 2_000

/** 挂了拍一拍气泡组件的页面（tab 页），只有这些页面才消费拍一拍 */
const BUBBLE_ROUTES = [
  'pages/index/index',
  'pages/cat/den',
  'pages/duel/hall',
  'pages/duel/list',
  'pages/profile/profile'
]

let timer: ReturnType<typeof setTimeout> | null = null
let running = false

function currentRoute(): string {
  const pages = getCurrentPages()
  return (pages[pages.length - 1] as unknown as { route?: string })?.route || ''
}

async function tick() {
  if (!getToken()) return
  const notifyStore = useNotificationStore()
  // 未读通知数：不消费，任何页面都刷新角标
  notifyStore.refreshUnread()
  // 拍一拍：读取即消费，只在能显示气泡的页面拉取
  if (!BUBBLE_ROUTES.includes(currentRoute())) return
  try {
    const box = await getMyNudges()
    if (box.count > 0 && box.items?.length) {
      notifyStore.pushNudges(box.items)
    }
  } catch {
    // 静默，下个周期重试
  }
}

function schedule() {
  timer = setTimeout(async () => {
    await tick()
    if (running) schedule()
  }, POLL_INTERVAL)
}

/** App 前台时启动轮询（幂等），首次延迟 2s 等页面就绪 */
export function startPolling() {
  if (!getToken()) return
  running = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(async () => {
    await tick()
    if (running) schedule()
  }, FIRST_TICK_DELAY)
}

/** App 切后台时停止 */
export function stopPolling() {
  running = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}
