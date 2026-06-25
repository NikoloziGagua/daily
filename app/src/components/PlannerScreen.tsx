import React, { useState } from 'react'
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
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="px-4 pt-3 pb-28 space-y-5"
    >
      <header className="px-1 flex justify-between items-end">
        <h1 className="text-[34px] font-bold tracking-[-0.5px] leading-tight">Planner</h1>
        <div className="flex gap-1 text-ios-blue pb-1.5">
          <button onClick={() => onSelect(addDays(selected, -7))} className="active:scale-90 transition-transform"><ChevronLeft size={26} /></button>
          <button onClick={() => onSelect(addDays(selected, 7))} className="active:scale-90 transition-transform"><ChevronRight size={26} /></button>
        </div>
      </header>

      <div className="flex justify-between gap-1">
        {week.map((k) => {
          const d = fromKey(k)
          const on = k === selected
          const isToday = k === dateKey()
          return (
            <button key={k} onClick={() => onSelect(k)} className="flex flex-col items-center gap-1.5 flex-1">
              <span className={`text-[11px] font-medium ${on ? 'text-ios-blue' : 'text-ios-secondary'}`}>{d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3)}</span>
              <motion.span
                animate={{ scale: on ? 1 : 1 }}
                className={`w-9 h-9 rounded-full grid place-content-center text-[16px] transition-colors ${on ? 'bg-ios-blue text-white font-semibold' : isToday ? 'text-ios-blue font-semibold' : 'text-ios-label'}`}
              >
                {d.getDate()}
              </motion.span>
            </button>
          )
        })}
      </div>

      <div className="px-1 flex justify-between items-baseline">
        <h2 className="text-[20px] font-semibold">{selDate.toLocaleDateString(undefined, { weekday: 'long' })}, {fmtMonthDay(selDate)}</h2>
        <span className="text-[14px] text-ios-secondary">{done}/{tasks.length} done</span>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-ios shadow-ios-sm py-10 text-center text-[15px] text-ios-tertiary">Nothing planned. Tap + to add a task to this day.</div>
      ) : (
        <div className="bg-white rounded-ios shadow-ios-sm overflow-hidden">
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
