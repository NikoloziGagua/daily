import React from 'react'
import { motion } from 'framer-motion'
import { Sun, LayoutDashboard, CalendarDays, StickyNote } from 'lucide-react'
import { haptic } from '../fx'

export type Tab = 'today' | 'dashboard' | 'planner' | 'notes'

const tabs: { id: Tab; label: string; icon: typeof Sun }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'dashboard', label: 'Stats', icon: LayoutDashboard },
  { id: 'planner', label: 'Plan', icon: CalendarDays },
  { id: 'notes', label: 'Notes', icon: StickyNote },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-40 flex justify-center pointer-events-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      <div className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-white/65 backdrop-blur-2xl border border-white/70 shadow-pop">
        {tabs.map((t) => {
          const Icon = t.icon
          const on = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => { onChange(t.id); haptic(8) }}
              className="relative flex items-center gap-1.5 rounded-full px-3.5 py-2.5 z-10"
            >
              {on && <motion.span layoutId="tabpill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <Icon size={20} strokeWidth={2.2} className={on ? 'text-white' : 'text-faint'} />
              {on && <span className="text-[13px] font-semibold text-white pr-1">{t.label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
