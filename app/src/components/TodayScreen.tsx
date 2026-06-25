import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { dateKey, fmtLong } from '../util'
import { ProgressRing, TaskRow } from './Shared'

export function TodayScreen() {
  const s = useStore()
  const today = dateKey()
  const tasks = s.tasksForDate(today)
  const done = tasks.filter((t) => t.completed).length
  const progress = tasks.length ? done / tasks.length : 0
  const intention = s.state.intentions[today] || ''

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="px-4 pt-3 pb-28 space-y-5"
    >
      <header className="px-1">
        <h1 className="text-[34px] font-bold tracking-[-0.5px] leading-tight">Today</h1>
        <p className="text-[15px] text-ios-secondary mt-0.5">{fmtLong(new Date())}</p>
      </header>

      <section className="bg-white rounded-2xl shadow-ios-sm p-5 flex items-center gap-5">
        <ProgressRing progress={progress} size={62} stroke={5} />
        <div>
          <h3 className="text-[17px] font-semibold">{tasks.length === 0 ? 'Plan your day' : done === tasks.length ? 'All done 🎉' : 'Keep going'}</h3>
          <p className="text-[14px] text-ios-secondary mt-0.5">
            {tasks.length === 0 ? 'Add a task to get started.' : `You've completed ${done} of ${tasks.length} today.`}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-ios shadow-ios-sm flex divide-x divide-ios-separator">
        {[
          { label: 'Streak', value: `${s.streak}` },
          { label: 'Consistency', value: `${s.consistency}%` },
          { label: 'Best', value: `${s.state.bestStreak}` },
        ].map((m) => (
          <div key={m.label} className="flex-1 py-3 text-center">
            <div className="text-[12px] uppercase tracking-wide text-ios-secondary font-medium">{m.label}</div>
            <div className="text-[19px] font-semibold mt-0.5">{m.value}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-[13px] uppercase tracking-wide text-ios-secondary font-medium px-4 mb-2">Intention</h2>
        <div className="bg-white rounded-ios shadow-ios-sm px-4 py-3.5">
          <input
            value={intention}
            onChange={(e) => s.setIntention(today, e.target.value)}
            placeholder="Set an intention for today…"
            className="w-full text-[16px] bg-transparent outline-none placeholder-ios-tertiary"
          />
        </div>
      </section>

      <section>
        <h2 className="text-[13px] uppercase tracking-wide text-ios-secondary font-medium px-4 mb-2">Priorities</h2>
        {tasks.length === 0 ? (
          <div className="bg-white rounded-ios shadow-ios-sm py-10 text-center text-[15px] text-ios-tertiary">No tasks yet. Tap + to add one.</div>
        ) : (
          <div className="bg-white rounded-ios shadow-ios-sm overflow-hidden">
            <AnimatePresence initial={false}>
              {tasks.map((t, i) => (
                <TaskRow key={t.id} task={t} onToggle={s.toggleTask} onDelete={s.deleteTask} isLast={i === tasks.length - 1} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </motion.div>
  )
}
