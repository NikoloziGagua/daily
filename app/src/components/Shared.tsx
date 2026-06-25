import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Task } from '../types'

export function ProgressRing({ progress, size = 60, stroke = 5 }: { progress: number; size?: number; stroke?: number }) {
  const reduce = useReducedMotion()
  const r = (size - stroke) / 2
  const c = r * 2 * Math.PI
  const offset = c - Math.min(1, Math.max(0, progress)) * c
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,122,255,0.16)" strokeWidth={stroke} fill="transparent" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke="#007AFF" strokeWidth={stroke} fill="transparent" strokeLinecap="round"
          style={{ strokeDasharray: c }}
          initial={{ strokeDashoffset: reduce ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.1, duration: 0.9 }}
        />
      </svg>
      <span className="absolute text-[14px] font-bold tracking-tight text-ios-label">{Math.round(progress * 100)}%</span>
    </div>
  )
}

export function TaskRow({ task, onToggle, onDelete, isLast }: { task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void; isLast?: boolean }) {
  const tags: { label: string; kind: 'must' | 'plain' | 'roll' }[] = []
  if (task.mustDo) tags.push({ label: 'Must-do', kind: 'must' })
  tags.push({ label: task.context, kind: 'plain' })
  tags.push({ label: `${task.minutes}m`, kind: 'plain' })
  if (task.rolledFrom && !task.completed) tags.unshift({ label: 'Rolled over', kind: 'roll' })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="relative flex items-center gap-3 bg-white px-4 py-3"
    >
      <button onClick={() => onToggle(task.id)} className="flex-none" aria-label="Toggle task">
        <motion.span
          whileTap={{ scale: 0.8 }}
          className={`grid place-content-center w-6 h-6 rounded-full border-[1.5px] transition-colors ${task.completed ? 'bg-ios-blue border-ios-blue' : 'bg-white border-ios-tertiary'}`}
        >
          <motion.svg width="13" height="13" viewBox="0 0 13 13" initial={false} animate={{ scale: task.completed ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
            <path d="M2.5 7l2.5 2.5L10.5 4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.span>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {task.rolledFrom && !task.completed && <span className="w-2 h-2 rounded-full bg-ios-orange flex-none" />}
          <span className={`text-[17px] leading-tight truncate transition-colors ${task.completed ? 'text-ios-secondary line-through' : 'text-ios-label'}`}>{task.title}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {tags.map((t, i) => (
            <span key={i} className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${t.kind === 'must' ? 'bg-ios-blue/10 text-ios-blue' : t.kind === 'roll' ? 'bg-ios-orange/15 text-ios-orange' : 'bg-ios-bg text-ios-secondary'}`}>{t.label}</span>
          ))}
        </div>
      </div>

      <button onClick={() => onDelete(task.id)} className="flex-none text-ios-tertiary active:text-ios-red transition-colors" aria-label="Delete task">
        <ChevronRight size={20} />
      </button>

      {!isLast && <div className="absolute bottom-0 left-[52px] right-0 ios-hairline-b" />}
    </motion.div>
  )
}
