import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { Flame, Check, ArrowRight, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { dateKey } from '../util'
import { ProgressRing, TaskRow } from './Shared'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function TodayScreen() {
  const s = useStore()
  const today = dateKey()
  const tasks = s.tasksForDate(today)
  const done = tasks.filter((t) => t.completed).length
  const progress = tasks.length ? done / tasks.length : 0
  const pct = Math.round(progress * 100)
  const upNext = tasks.find((t) => !t.completed && t.mustDo) || tasks.find((t) => !t.completed)
  const minutesLeft = tasks.filter((t) => !t.completed).reduce((a, t) => a + t.minutes, 0)
  const intention = s.state.intentions[today] || ''

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-4 pb-28">
      <motion.header variants={item} className="px-1 mb-4">
        <p className="text-[15px] text-sub font-medium">{greeting()}</p>
        <h1 className="text-[32px] font-extrabold tracking-[-0.03em] leading-none mt-0.5">Today</h1>
      </motion.header>

      <div className="grid grid-cols-2 gap-3">
        {/* Hero progress */}
        <motion.section variants={item} className="col-span-2 bg-card rounded-tile shadow-tile p-5 flex items-center gap-5">
          <ProgressRing progress={progress} size={84} stroke={8} label={<span className="text-[20px] font-extrabold tracking-tight"><NumberFlow value={pct} />%</span>} />
          <div className="flex-1">
            <h3 className="text-[18px] font-bold tracking-tight">{tasks.length === 0 ? 'Plan your day' : done === tasks.length ? 'All done' : 'Keep going'}</h3>
            <p className="text-[14px] text-sub mt-0.5">{tasks.length === 0 ? 'Add a task to get started.' : `${done} of ${tasks.length} tasks complete`}</p>
            <div className="flex gap-1.5 mt-3">
              {tasks.slice(0, 8).map((t) => (
                <span key={t.id} className={`h-1.5 flex-1 rounded-full ${t.completed ? 'bg-accent' : 'bg-paper2'}`} />
              ))}
              {tasks.length === 0 && <span className="h-1.5 flex-1 rounded-full bg-paper2" />}
            </div>
          </div>
        </motion.section>

        {/* Streak */}
        <motion.section variants={item} className="bg-card rounded-tile shadow-tile p-5">
          <div className="w-9 h-9 rounded-full bg-[#FFF0E8] grid place-content-center"><Flame size={19} className="text-flame" /></div>
          <div className="text-[30px] font-extrabold tracking-tight mt-3 leading-none"><NumberFlow value={s.streak} /></div>
          <p className="text-[13px] text-sub mt-1">day streak</p>
        </motion.section>

        {/* Consistency */}
        <motion.section variants={item} className="bg-card rounded-tile shadow-tile p-5">
          <div className="w-9 h-9 rounded-full bg-accentSoft grid place-content-center"><Sparkles size={18} className="text-accent" /></div>
          <div className="text-[30px] font-extrabold tracking-tight mt-3 leading-none"><NumberFlow value={s.consistency} />%</div>
          <p className="text-[13px] text-sub mt-1">consistency</p>
        </motion.section>

        {/* Up next */}
        <motion.section variants={item} className="col-span-2 rounded-tile p-5 bg-ink text-white shadow-pop">
          <p className="text-[12px] uppercase tracking-[0.08em] text-white/55 font-semibold">Up next</p>
          <AnimatePresence mode="wait">
            {upNext ? (
              <motion.div key={upNext.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-4 mt-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[19px] font-bold leading-snug">{upNext.title}</p>
                  <div className="flex gap-2 mt-1.5 text-[13px] text-white/60">
                    {upNext.mustDo && <span className="text-accent font-semibold">Must-do</span>}
                    <span>{upNext.context}</span><span>·</span><span>{upNext.minutes} min</span>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => s.toggleTask(upNext.id)}
                  className="flex-none w-12 h-12 rounded-full bg-white text-ink grid place-content-center shadow-lg">
                  <Check size={24} strokeWidth={2.6} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="clear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-[18px] font-bold">
                <Check size={22} className="text-accent" /> All clear for today
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Intention */}
        <motion.section variants={item} className="col-span-2 bg-card rounded-tile shadow-tile px-5 py-4">
          <input value={intention} onChange={(e) => s.setIntention(today, e.target.value)}
            placeholder="✍️  Set an intention for today…"
            className="w-full text-[16px] bg-transparent outline-none placeholder-faint" />
        </motion.section>
      </div>

      {/* Task list */}
      <motion.div variants={item} className="mt-6">
        <div className="flex items-baseline justify-between px-1 mb-2">
          <h2 className="text-[20px] font-bold tracking-tight">Tasks</h2>
          <span className="text-[14px] text-sub">{minutesLeft} min left</span>
        </div>
        {tasks.length === 0 ? (
          <div className="bg-card rounded-tile shadow-tile py-12 text-center text-[15px] text-faint flex flex-col items-center gap-2">
            <ArrowRight size={22} className="rotate-90 text-faint" /> Tap + to add your first task.
          </div>
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
    </motion.div>
  )
}
