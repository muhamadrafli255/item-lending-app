const map = new Map()

export function rateLimit(ip: string) {
  const now = Date.now()
  const window = 60 * 1000

  const record = map.get(ip)

  if (!record || now - record.time > window) {
    map.set(ip, { count: 1, time: now })
    return true
  }

  if (record.count > 5) return false

  record.count++
  return true
}