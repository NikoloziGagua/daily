export const CONTEXTS = ['Home', 'Work', 'Errands'] as const

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

export function weekKeys(anchor: string): string[] {
  const d = fromKey(anchor)
  const mondayOffset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - mondayOffset)
  const keys: string[] = []
  for (let i = 0; i < 7; i++) {
    keys.push(dateKey(d))
    d.setDate(d.getDate() + 1)
  }
  return keys
}

export function fmtLong(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

export function fmtWeekday(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

export function fmtMonthDay(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function fmtRelative(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const today = dateKey()
  const k = dateKey(d)
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (k === today) return time
  if (k === addDays(today, -1)) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function clampMinutes(n: number): number {
  if (!Number.isFinite(n)) return 25
  return Math.min(300, Math.max(5, Math.round(n)))
}
