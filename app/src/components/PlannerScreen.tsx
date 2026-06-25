import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { addDays, dateKey, fromKey, fmtMonthDay, weekKeys } from '../util'
import { TaskRow } from './Shared'

export function PlannerScreen({ selected, onSelect }: { selected: string; onSelect: (k: string) => void }) {
  const s = useStore()
  const week = weekKeys(selected)
  const tasks = s.tasksForDate(selected)
  const done = tasks.filter((t) => t.completed).length
  const selDate = fromKey(selected)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }} className="px-4 pt-4 pb-28">
      <header className="px-1 mb-4 flex justify-between items-end">
        <div>
          <p className="text-[15px] text-sub font-medium">This week</p>
          <h1 className="text-[32px] font-extrabold tracking-[-0.03em] leading-none mt-0.5">Planner</h1>
        </div>
        <div className="flex gap-1 text-ink pb-1">
          <button onClick={() => onSelect(addDays(selected, -7))} className="w-9 h-9 rounded-full bg-card shadow-tile grid place-content-center active:scale-90 transition-transform"><ChevronLeft size={20} /></button>
          <button onClick={() => onSelect(addDays(selected, 7))} className="w-9 h-9 rounded-full bg-card shadow-tile grid place-content-center active:scale-90 transition-transform"><ChevronRight size={20} /></button>
        </div>
      </header>

      <div className="bg-card rounded-tile shadow-tile p-2.5 flex justify-between gap-1">
        {week.map((k) => {
          const d = fromKey(k)
          const on = k === selected
          const isToday = k === dateKey()
          const dt = s.tasksForDate(k)
          const allDone = dt.length > 0 && dt.every((t) => t.completed)
          return (
            <button key={k} onClick={() => onSelect(k)} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-colors ${on ? 'bg-ink text-white' : ''}`}>
              <span className={`text-[11px] font-semibold ${on ? 'text-white/70' : 'text-sub'}`}>{d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}</span>
              <span className={`text-[16px] font-bold ${on ? 'text-white' : isToday ? 'text-accent' : 'text-ink'}`}>{d.getDate()}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${dt.length === 0 ? 'opacity-0 bg-faint' : on ? 'bg-white' : allDone ? 'bg-ok' : 'bg-accent'}`} />
            </button>
          )
        })}
      </div>

      <div className="px-1 mt-5 mb-2 flex justify-between items-baseline">
        <h2 className="text-[20px] font-bold tracking-tight">{selDate.toLocaleDateString(undefined, { weekday: 'long' })}</h2>
        <span className="text-[14px] text-sub">{fmtMonthDay(selDate)} · {done}/{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-card rounded-tile shadow-tile py-12 text-center text-[15px] text-faint">Nothing planned. Tap + to add a task.</div>
      ) : (
        <div className="bg-card rounded-tile shadow-tile overflow-hidden">
          <AnimatePresence initial={false}>
            {tasks.map((t, i) => (
              <TaskRow key={t.id} task={t} onToggle={s.toggleTask} onDelete={s.deleteTask} isLast={i === tasks.length - 1} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export { PlannerScreen as default }
