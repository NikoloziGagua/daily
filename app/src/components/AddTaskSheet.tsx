import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Context } from '../types'
import { CONTEXTS } from '../util'

interface Props {
  open: boolean
  onClose: () => void
  date: string
  onAdd: (input: { title: string; context: Context; minutes: number; mustDo: boolean; date: string }) => void
}

export function AddTaskSheet({ open, onClose, date, onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [context, setContext] = useState<Context>('Home')
  const [minutes, setMinutes] = useState(25)
  const [mustDo, setMustDo] = useState(false)

  useEffect(() => {
    if (open) { setTitle(''); setContext('Home'); setMinutes(25); setMustDo(false) }
  }, [open])

  const submit = () => {
    if (!title.trim()) return
    onAdd({ title, context, minutes, mustDo, date })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/40 z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 bg-paper rounded-t-sheet z-[70] flex flex-col shadow-ios-lg"
            style={{ maxHeight: '88%' }}
          >
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 bg-ios-tertiary rounded-full" />
            </div>
            <div className="flex justify-between items-center px-4 py-3 ios-hairline-b">
              <button onClick={onClose} className="text-ios-blue text-[17px]">Cancel</button>
              <h2 className="text-[17px] font-semibold">New Task</h2>
              <button onClick={submit} className={`text-[17px] font-semibold ${title.trim() ? 'text-ios-blue' : 'text-ios-tertiary'}`}>Add</button>
            </div>

            <div className="p-4 space-y-5 overflow-y-auto hide-scrollbar">
              <div className="bg-white rounded-ios shadow-tile px-4 py-3.5">
                <input
                  autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="What do you want to do?"
                  className="w-full text-[17px] bg-transparent outline-none placeholder-ios-tertiary"
                />
              </div>

              <div>
                <p className="text-[13px] uppercase tracking-wide text-ios-secondary font-medium px-1 mb-2">Context</p>
                <div className="flex gap-1 bg-ios-gray6 p-1 rounded-[10px]">
                  {CONTEXTS.map((c) => (
                    <button key={c} onClick={() => setContext(c)}
                      className={`flex-1 py-2 rounded-[8px] text-[15px] font-medium transition-colors ${context === c ? 'bg-white text-ios-label shadow-tile' : 'text-ios-secondary'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-ios shadow-tile overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 ios-hairline-b">
                  <span className="text-[17px]">Estimate</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setMinutes((m) => Math.max(5, m - 5))} className="w-8 h-8 rounded-full bg-ios-gray6 text-ios-blue text-[20px] grid place-content-center active:scale-90 transition-transform">–</button>
                    <span className="text-[17px] tabular-nums w-14 text-center">{minutes} min</span>
                    <button onClick={() => setMinutes((m) => Math.min(300, m + 5))} className="w-8 h-8 rounded-full bg-ios-gray6 text-ios-blue text-[20px] grid place-content-center active:scale-90 transition-transform">+</button>
                  </div>
                </div>
                <button onClick={() => setMustDo((v) => !v)} className="w-full flex items-center justify-between px-4 py-3">
                  <span className="text-[17px]">Must-do</span>
                  <span className={`relative w-[51px] h-[31px] rounded-full transition-colors ${mustDo ? 'bg-ios-green' : 'bg-ios-tertiary'}`}>
                    <motion.span layout className="absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow" style={{ left: mustDo ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
