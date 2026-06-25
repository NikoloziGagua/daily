import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, CalendarDays, FileText } from 'lucide-react'

export type Tab = 'today' | 'planner' | 'notes'

const tabs: { id: Tab; label: string; icon: typeof CheckCircle2 }[] = [
  { id: 'today', label: 'Today', icon: CheckCircle2 },
  { id: 'planner', label: 'Planner', icon: CalendarDays },
  { id: 'notes', label: 'Notes', icon: FileText },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex-none ios-hairline-t bg-white/80 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-stretch px-4 pt-2 pb-1.5 max-w-[500px] mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon
          const on = active === t.id
          return (
            <button key={t.id} onClick={() => onChange(t.id)} className="flex flex-col items-center justify-center w-20 gap-0.5">
              <motion.span whileTap={{ scale: 0.85 }} animate={{ scale: on ? 1.04 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                <Icon size={25} strokeWidth={on ? 2.4 : 1.9} className={on ? 'text-ios-blue' : 'text-ios-secondary'} />
              </motion.span>
              <span className={`text-[10px] font-medium ${on ? 'text-ios-blue' : 'text-ios-secondary'}`}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
