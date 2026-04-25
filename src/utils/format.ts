export const formatDate = (date: string | Date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

export const formatPoints = (points: number) => {
  return points.toLocaleString('zh-CN')
}

export const getLevelProgress = (exp: number, maxExp: number) => {
  return (exp / maxExp) * 100
}