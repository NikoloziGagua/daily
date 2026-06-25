import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { StoreProvider, useStore } from './store'
import { TabBar, Tab } from './components/TabBar'
import { TodayScreen } from './components/TodayScreen'
import { DashboardScreen } from './components/DashboardScreen'
import { PlannerScreen } from './components/PlannerScreen'
import { NotesScreen } from './components/NotesScreen'
import { AddTaskSheet } from './components/AddTaskSheet'
import { FocusMode } from './components/FocusMode'
import { dateKey } from './util'
import { haptic } from './fx'

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

function Shell() {
  const s = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [plannerDate, setPlannerDate] = useState(dateKey())
  const [addOpen, setAddOpen] = useState(false)
  const [focusOpen, setFocusOpen] = useState(false)

  const showFab = tab === 'today' || tab === 'planner'
  const addDate = tab === 'planner' ? plannerDate : dateKey()

  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: '#E5D0B4' }}>
      <div className="relative w-full max-w-[500px] min-h-[100dvh] flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#F8EFE0 0%,#F3E2CF 55%,#EBD3B8 100%)' }}>
        {/* warm blobs for the glass to pick up */}
        <div className="pointer-events-none absolute inset-0 z-0" style={{ background:
          'radial-gradient(38% 26% at 12% 12%,rgba(255,224,192,0.75),transparent 60%),' +
          'radial-gradient(42% 30% at 90% 8%,rgba(246,212,188,0.65),transparent 60%),' +
          'radial-gradient(48% 38% at 84% 90%,rgba(231,206,176,0.6),transparent 60%),' +
          'radial-gradient(40% 36% at 6% 92%,rgba(240,222,196,0.6),transparent 60%)' }} />
        {/* film grain */}
        <div className="pointer-events-none absolute inset-0 z-[5] opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />

        <main className="relative z-10 flex-1 overflow-y-auto hide-scrollbar" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <AnimatePresence mode="wait">
            {tab === 'today' && <TodayScreen key="today" onFocus={() => { haptic(10); setFocusOpen(true) }} />}
            {tab === 'dashboard' && <DashboardScreen key="dashboard" />}
            {tab === 'planner' && <PlannerScreen key="planner" selected={plannerDate} onSelect={setPlannerDate} />}
            {tab === 'notes' && <NotesScreen key="notes" />}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showFab && (
            <motion.button
              key="fab"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              onClick={() => { haptic(10); setAddOpen(true) }}
              className="absolute right-5 bottom-[104px] w-14 h-14 rounded-full bg-ink text-white grid place-content-center shadow-pop z-40"
              style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
              aria-label="Add task"
            >
              <Plus size={28} strokeWidth={2.4} />
            </motion.button>
          )}
        </AnimatePresence>

        <TabBar active={tab} onChange={setTab} />

        <AddTaskSheet open={addOpen} onClose={() => setAddOpen(false)} date={addDate} onAdd={s.addTask} />
        <FocusMode open={focusOpen} onClose={() => setFocusOpen(false)} />
      </div>
    </div>
  )
}

export function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
