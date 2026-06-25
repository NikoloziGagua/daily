import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { StoreProvider, useStore } from './store'
import { TabBar, Tab } from './components/TabBar'
import { TodayScreen } from './components/TodayScreen'
import { PlannerScreen } from './components/PlannerScreen'
import { NotesScreen } from './components/NotesScreen'
import { AddTaskSheet } from './components/AddTaskSheet'
import { dateKey } from './util'

function Shell() {
  const s = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [plannerDate, setPlannerDate] = useState(dateKey())
  const [addOpen, setAddOpen] = useState(false)

  const showFab = tab === 'today' || tab === 'planner'
  const addDate = tab === 'planner' ? plannerDate : dateKey()

  return (
    <div className="min-h-[100dvh] bg-paper flex justify-center">
      <div className="relative w-full max-w-[500px] min-h-[100dvh] bg-paper flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto hide-scrollbar" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <AnimatePresence mode="wait">
            {tab === 'today' && <TodayScreen key="today" />}
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
              onClick={() => setAddOpen(true)}
              className="absolute right-5 bottom-[88px] w-14 h-14 rounded-full bg-ink text-white grid place-content-center shadow-pop z-50"
              style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
              aria-label="Add task"
            >
              <Plus size={28} strokeWidth={2.4} />
            </motion.button>
          )}
        </AnimatePresence>

        <TabBar active={tab} onChange={setTab} />

        <AddTaskSheet open={addOpen} onClose={() => setAddOpen(false)} date={addDate} onAdd={s.addTask} />
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
