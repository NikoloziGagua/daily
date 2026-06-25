import React from 'react'
import { motion } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { Check, Target, Clock, Trophy } from 'lucide-react'
import { useStore } from '../store'
import { addDays, dateKey, fromKey } from '../util'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
}

function fmtDuration(min: number) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function DashboardScreen() {
  const s = useStore()
  const today = dateKey()
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, -(6 - i)))
  const last7set = new Set(last7)

  const perDay = last7.map((k) => {
    const ts = s.state.tasks.filter((t) => t.date === k)
    return { key: k, date: fromKey(k), total: ts.length, done: ts.filter((t) => t.completed).length }
  })
  const maxDone = Math.max(1, ...perDay.map((d) => d.done))
  const weekDone = perDay.reduce((a, d) => a + d.done, 0)

  const weekMust = s.state.tasks.filter((t) => last7set.has(t.date) && t.mustDo)
  const mustRate = weekMust.length ? Math.round((weekMust.filter((t) => t.completed).length / weekMust.length) * 100) : 0
  const focusMin = s.state.tasks.filter((t) => last7set.has(t.date) && t.completed).reduce((a, t) => a + t.minutes, 0)

  const ctxs: Array<'Home' | 'Work' | 'Errands'> = ['Home', 'Work', 'Errands']
  const byCtx = ctxs.map((c) => ({
    ctx: c,
    min: s.state.tasks.filter((t) => last7set.has(t.date) && t.completed && t.context === c).reduce((a, t) => a + t.minutes, 0),
  }))
  const maxCtx = Math.max(1, ...byCtx.map((x) => x.min))

  const wins = s.state.tasks
    .filter((t) => t.completed && t.mustDo)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 4)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-4 pb-28">
      <motion.header variants={item} className="px-1 mb-4">
        <p className="text-[15px] text-sub font-medium">Last 7 days</p>
        <h1 className="text-[32px] font-extrabold tracking-[-0.03em] leading-none mt-0.5">Dashboard</h1>
      </motion.header>

      <div className="grid grid-cols-2 gap-3">
        {/* Weekly chart hero */}
        <motion.section variants={item} className="col-span-2 glass rounded-tile p-5">
          <div className="flex items-baseline gap-2">
            <span className="text-[34px] font-extrabold tracking-tight leading-none"><NumberFlow value={weekDone} /></span>
            <span className="text-[15px] text-sub font-medium">{weekDone === 1 ? 'task' : 'tasks'} done this week</span>
          </div>
          <div className="flex items-end gap-2 h-[116px] mt-4">
            {perDay.map((d, i) => {
              const h = Math.round((d.done / maxDone) * 104)
              const isToday = d.key === today
              return (
                <div key={d.key} className="flex-1 h-full flex items-end">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: Math.max(h, 5) }}
                    transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 + i * 0.05 }}
                    className={`w-full rounded-lg ${d.done > 0 ? 'bg-accent' : 'bg-paper2'} ${isToday ? 'ring-2 ring-accent/25' : ''}`}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 mt-2">
            {perDay.map((d) => (
              <span key={d.key} className={`flex-1 text-center text-[11px] font-semibold ${d.key === today ? 'text-accent' : 'text-faint'}`}>
                {d.date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Must-do rate */}
        <motion.section variants={item} className="glass rounded-tile p-5">
          <div className="w-9 h-9 rounded-full bg-accentSoft grid place-content-center"><Target size={18} className="text-accent" /></div>
          <div className="text-[30px] font-extrabold tracking-tight mt-3 leading-none"><NumberFlow value={mustRate} />%</div>
          <p className="text-[13px] text-sub mt-1">must-do rate</p>
        </motion.section>

        {/* Focus time */}
        <motion.section variants={item} className="glass rounded-tile p-5">
          <div className="w-9 h-9 rounded-full bg-[#FFF0E8] grid place-content-center"><Clock size={18} className="text-flame" /></div>
          <div className="text-[30px] font-extrabold tracking-tight mt-3 leading-none">{fmtDuration(focusMin)}</div>
          <p className="text-[13px] text-sub mt-1">focused time</p>
        </motion.section>

        {/* By context */}
        <motion.section variants={item} className="col-span-2 glass rounded-tile p-5">
          <p className="text-[12px] uppercase tracking-[0.07em] text-sub font-semibold mb-3.5">Time by context</p>
          <div className="space-y-3">
            {byCtx.map((c, i) => (
              <div key={c.ctx} className="flex items-center gap-3">
                <span className="w-16 text-[14px] text-ink font-medium">{c.ctx}</span>
                <div className="flex-1 h-2.5 bg-paper2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(c.min / maxCtx) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.2 + i * 0.06 }}
                    className="h-full bg-accent rounded-full" />
                </div>
                <span className="w-12 text-right text-[13px] font-semibold text-sub">{c.min}m</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Recent wins */}
        <motion.section variants={item} className="col-span-2 glass rounded-tile p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-flame" />
            <p className="text-[12px] uppercase tracking-[0.07em] text-sub font-semibold">Recent wins</p>
          </div>
          {wins.length === 0 ? (
            <p className="text-[14px] text-faint py-2">Complete a must-do task to see your wins here.</p>
          ) : (
            <div className="divide-y divide-line">
              {wins.map((w) => (
                <div key={w.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 h-6 rounded-full bg-accent grid place-content-center flex-none"><Check size={14} strokeWidth={3} className="text-white" /></span>
                  <span className="text-[15px] text-ink truncate">{w.title}</span>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  )
}
