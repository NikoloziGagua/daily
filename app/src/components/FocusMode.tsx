import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, Check, RotateCcw } from 'lucide-react'
import { useStore } from '../store'
import { dateKey } from '../util'
import { celebrate, haptic } from '../fx'

export function FocusMode({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore()
  const today = dateKey()
  const [queue, setQueue] = useState<string[]>([])
  const [dir, setDir] = useState(1)
  const [total, setTotal] = useState(0)
  const celebrated = useRef(false)

  useEffect(() => {
    if (open) {
      const ids = s.tasksForDate(today).filter((t) => !t.completed).map((t) => t.id)
      setQueue(ids)
      setTotal(ids.length)
      celebrated.current = false
    }
  }, [open])

  const byId = React.useMemo(() => Object.fromEntries(s.state.tasks.map((t) => [t.id, t])), [s.state.tasks])
  const current = queue.map((id) => byId[id]).filter(Boolean)[0]
  const next = queue.map((id) => byId[id]).filter(Boolean)[1]
  const done = total - queue.length

  const complete = () => { if (!current) return; setDir(1); haptic(16); s.toggleTask(current.id); setQueue((q) => q.slice(1)) }
  const skip = () => { setDir(-1); haptic(8); setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]] : q)) }
  const onEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110) complete()
    else if (info.offset.x < -110) skip()
  }

  useEffect(() => {
    if (open && queue.length === 0 && total > 0 && !celebrated.current) { celebrated.current = true; celebrate() }
  }, [open, queue.length, total])

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[80] bg-paper flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          {/* glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-50 pointer-events-none" style={{ background: 'radial-gradient(closest-side,#7C7CF5,transparent)' }} />

          <header className="relative flex items-center justify-between px-5 pt-4">
            <span className="text-[15px] font-semibold text-sub">{Math.min(done + 1, total)} / {total || 0}</span>
            <span className="text-[13px] uppercase tracking-[0.14em] text-faint font-semibold">Focus</span>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-card shadow-tile grid place-content-center active:scale-90 transition-transform"><X size={18} /></button>
          </header>

          {/* progress segments */}
          <div className="relative flex gap-1.5 px-5 mt-4">
            {Array.from({ length: total || 1 }).map((_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full ${i < done ? 'bg-accent' : 'bg-paper2'}`} />
            ))}
          </div>

          <div className="relative flex-1 grid place-items-center px-7">
            {current ? (
              <div className="relative w-full" style={{ height: 360 }}>
                {next && (
                  <div className="absolute inset-x-3 top-5 bottom-0 rounded-[30px] bg-card shadow-tile opacity-70 scale-95" />
                )}
                <AnimatePresence custom={dir} mode="popLayout">
                  <motion.div
                    key={current.id}
                    custom={dir}
                    initial={{ opacity: 0, y: 26, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={(d: number) => ({ x: d > 0 ? 360 : -360, opacity: 0, rotate: d > 0 ? 14 : -14, transition: { duration: 0.3 } })}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    drag="x" dragSnapToOrigin dragElastic={0.7} onDragEnd={onEnd}
                    className="absolute inset-0 rounded-[30px] bg-card shadow-pop p-7 flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      {current.mustDo ? <span className="text-[12px] font-bold text-accent bg-accentSoft px-3 py-1 rounded-full tracking-wide">MUST-DO</span> : <span />}
                      <span className="text-[14px] text-sub font-medium">{current.minutes} min · {current.context}</span>
                    </div>
                    <p className="text-[30px] font-extrabold tracking-[-0.02em] leading-[1.12] mt-14">{current.title}</p>
                    <p className="text-[15px] text-sub mt-auto">Swipe right to finish · left to skip</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-20 h-20 rounded-full bg-accent grid place-content-center mx-auto shadow-pop"><Check size={40} strokeWidth={2.6} className="text-white" /></div>
                <p className="text-[26px] font-extrabold tracking-tight mt-6">{total > 0 ? 'All done!' : 'Nothing to focus on'}</p>
                <p className="text-[15px] text-sub mt-1">{total > 0 ? "You cleared today's list." : 'Add a task to start a focus session.'}</p>
              </motion.div>
            )}
          </div>

          <div className="relative flex justify-center items-center gap-8 pb-8">
            {current ? (
              <>
                <button onClick={skip} className="w-16 h-16 rounded-full bg-card shadow-tile grid place-content-center text-sub active:scale-90 transition-transform"><RotateCcw size={24} /></button>
                <button onClick={complete} className="w-[78px] h-[78px] rounded-full bg-ink text-white grid place-content-center shadow-pop active:scale-90 transition-transform"><Check size={34} strokeWidth={2.6} /></button>
              </>
            ) : (
              <button onClick={onClose} className="px-8 h-12 rounded-full bg-ink text-white font-semibold active:scale-95 transition-transform">Done</button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
