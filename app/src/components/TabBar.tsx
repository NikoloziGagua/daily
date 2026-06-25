import React from 'react'
import { motion } from 'framer-motion'
import { Sun, LayoutDashboard, CalendarDays, StickyNote } from 'lucide-react'

export type Tab = 'today' | 'dashboard' | 'planner' | 'notes'

const tabs: { id: Tab; label: string; icon: typeof Sun }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'Planner', icon: CalendarDays },
  { id: 'notes', label: 'Notes', icon: StickyNote },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex-none border-t border-line bg-paper/85 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-stretch px-2 pt-2 pb-1.5 max-w-[500px] mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon
          const on = active === t.id
          return (
            <button key={t.id} onClick={() => onChange(t.id)} className="flex flex-col items-center justify-center flex-1 gap-1">
              <motion.span whileTap={{ scale: 0.85 }} animate={{ scale: on ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                <Icon size={22} strokeWidth={on ? 2.4 : 1.9} className={on ? 'text-accent' : 'text-faint'} />
              </motion.span>
              <span className={`text-[10px] font-semibold ${on ? 'text-accent' : 'text-faint'}`}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
