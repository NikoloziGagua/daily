import React from 'react'
import { motion, useReducedMotion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'
import { Task } from '../types'
import { haptic } from '../fx'

export function ProgressRing({ progress, size = 60, stroke = 5, label }: { progress: number; size?: number; stroke?: number; label?: React.ReactNode }) {
  const reduce = useReducedMotion()
  const r = (size - stroke) / 2
  const c = r * 2 * Math.PI
  const offset = c - Math.min(1, Math.max(0, progress)) * c
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E7DCC8" strokeWidth={stroke} fill="transparent" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke="#9C7A57" strokeWidth={stroke} fill="transparent" strokeLinecap="round"
          style={{ strokeDasharray: c }}
          initial={{ strokeDashoffset: reduce ? offset : c }}
          animate={{ strokeDashoffset: offset }}
          transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0.12, duration: 1 }}
        />
      </svg>
      <span className="absolute text-ink">{label ?? <span className="text-[14px] font-bold tracking-tight">{Math.round(progress * 100)}%</span>}</span>
    </div>
  )
}

export function TaskRow({ task, onToggle, onDelete, isLast }: { task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void; isLast?: boolean }) {
  const x = useMotionValue(0)
  const doneOpacity = useTransform(x, [12, 92], [0, 1])
  const doneScale = useTransform(x, [12, 92], [0.6, 1])
  const delOpacity = useTransform(x, [-92, -12], [1, 0])
  const delScale = useTransform(x, [-92, -12], [1, 0.6])

  const chips: { label: string; kind: 'must' | 'plain' | 'roll' }[] = []
  if (task.rolledFrom && !task.completed) chips.push({ label: 'Rolled over', kind: 'roll' })
  if (task.mustDo) chips.push({ label: 'Must-do', kind: 'must' })
  chips.push({ label: task.context, kind: 'plain' })
  chips.push({ label: `${task.minutes}m`, kind: 'plain' })

  const onEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 96) { haptic(14); onToggle(task.id) }
    else if (info.offset.x < -96) { haptic([10, 30]); onDelete(task.id) }
  }

  return (
    <motion.div layout exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }} className="relative overflow-hidden">
      {/* reveal: complete (left) / delete (right) */}
      <div className="absolute inset-0 bg-ok flex items-center pl-6 pointer-events-none">
        <motion.span style={{ opacity: doneOpacity, scale: doneScale }} className="text-white"><Check size={22} strokeWidth={2.6} /></motion.span>
      </div>
      <div className="absolute inset-0 bg-[#FF3B30] flex items-center justify-end pr-6 pointer-events-none">
        <motion.span style={{ opacity: delOpacity, scale: delScale }} className="text-white"><Trash2 size={20} /></motion.span>
      </div>

      <motion.div
        drag="x" style={{ x }} dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={0.55} dragSnapToOrigin onDragEnd={onEnd}
        className="relative flex items-center gap-3 px-4 py-3.5 bg-card"
      >
        <button onClick={() => { haptic(10); onToggle(task.id) }} className="flex-none" aria-label="Toggle task">
          <motion.span
            whileTap={{ scale: 0.8 }}
            className={`grid place-content-center w-[26px] h-[26px] rounded-full border-[1.5px] transition-colors ${task.completed ? 'bg-accent border-accent' : 'bg-transparent border-faint'}`}
          >
            <motion.svg width="14" height="14" viewBox="0 0 14 14" initial={false} animate={{ scale: task.completed ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
              <path d="M3 7.4l2.6 2.6L11 4.4" stroke="#fff" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.span>
        </button>

        <div className="flex-1 min-w-0">
          <span className={`text-[17px] leading-tight transition-colors ${task.completed ? 'text-faint line-through' : 'text-ink'}`}>{task.title}</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {chips.map((c, i) => (
              <span key={i} className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${c.kind === 'must' ? 'bg-accentSoft text-accent' : c.kind === 'roll' ? 'bg-[#FCEDE5] text-flame' : 'bg-paper2 text-sub'}`}>{c.label}</span>
            ))}
          </div>
        </div>

        <span className="flex-none text-faint/70 text-[11px] font-medium select-none">swipe</span>

        {!isLast && <div className="absolute bottom-0 left-[52px] right-0 ios-hairline-b" />}
      </motion.div>
    </motion.div>
  )
}
