import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AppState, Note, Task, Context } from './types'
import { addDays, clampMinutes, dateKey, uid } from './util'

const KEY = 'daily_compass_state_v2'
const MAX_BACKFILL = 30

function seed(): AppState {
  const today = dateKey()
  const now = new Date().toISOString()
  const mk = (title: string, ctx: Context, min: number, must: boolean, done: boolean, rolled: string | null = null): Task => ({
    id: uid(), title, context: ctx, minutes: min, mustDo: must, completed: done,
    completedAt: done ? now : null, createdAt: now, rolledFrom: rolled, date: today,
  })
  return {
    tasks: [
      mk('Review the Q3 roadmap', 'Work', 45, true, false, addDays(today, -1)),
      mk('Finalize design tokens', 'Work', 30, true, true),
      mk('Grocery run for the week', 'Errands', 40, false, false),
      mk('Call mom', 'Home', 15, false, false),
    ],
    notes: [
      { id: uid(), title: 'Trip ideas', body: 'Lisbon in autumn, or a quiet week in the Dolomites.', pinned: true, createdAt: now, updatedAt: now },
      { id: uid(), title: 'App ideas', body: 'A calm planner that adapts to your routine and nudges gently.', pinned: false, createdAt: now, updatedAt: now },
    ],
    intentions: { [today]: 'Focus on deep work and protect the morning.' },
    lastOpened: today,
    bestStreak: 3,
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    const p = JSON.parse(raw)
    return {
      tasks: Array.isArray(p.tasks) ? p.tasks : [],
      notes: Array.isArray(p.notes) ? p.notes : [],
      intentions: p.intentions && typeof p.intentions === 'object' ? p.intentions : {},
      lastOpened: typeof p.lastOpened === 'string' ? p.lastOpened : dateKey(),
      bestStreak: Number(p.bestStreak) || 0,
    }
  } catch {
    return seed()
  }
}

function rollover(state: AppState): AppState {
  const today = dateKey()
  if (state.lastOpened === today) return state
  const earliest = addDays(today, -MAX_BACKFILL)
  let changed = false
  const tasks = state.tasks.map((t) => {
    if (!t.completed && t.date < today && t.date >= earliest) {
      changed = true
      return { ...t, date: today, rolledFrom: t.rolledFrom || t.date }
    }
    return t
  })
  return { ...state, tasks: changed ? tasks : state.tasks, lastOpened: today }
}

interface Store {
  state: AppState
  tasksForDate: (d: string) => Task[]
  addTask: (input: { title: string; context: Context; minutes: number; mustDo: boolean; date: string }) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, fields: Partial<Task>) => void
  deleteTask: (id: string) => void
  setIntention: (date: string, text: string) => void
  addNote: (n: { title: string; body: string; pinned: boolean }) => void
  updateNote: (id: string, fields: Partial<Note>) => void
  deleteNote: (id: string) => void
  togglePin: (id: string) => void
  streak: number
  consistency: number
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => rollover(load()))

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])

  // Re-run rollover when the day changes while the app stays open
  // (PWA left open past midnight, or resumed from the background days later).
  useEffect(() => {
    const check = () => setState((s) => rollover(s)) // no-op (same ref) unless the day changed
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    const id = setInterval(check, 60_000)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
    }
  }, [])

  const api = useMemo<Store>(() => {
    const tasksForDate = (d: string) => state.tasks.filter((t) => t.date === d)

    const successfulDay = (d: string) => {
      const ts = state.tasks.filter((t) => t.date === d)
      if (ts.length === 0) return false
      const must = ts.filter((t) => t.mustDo)
      if (must.length > 0) return must.every((t) => t.completed)
      return ts.filter((t) => t.completed).length / ts.length >= 0.7
    }

    let streak = 0
    let cursor = dateKey()
    if (!successfulDay(cursor)) cursor = addDays(cursor, -1)
    while (successfulDay(cursor)) { streak++; cursor = addDays(cursor, -1) }

    let total = 0, done = 0
    for (let i = 0; i < 14; i++) {
      const k = addDays(dateKey(), -i)
      const ts = state.tasks.filter((t) => t.date === k)
      total += ts.length
      done += ts.filter((t) => t.completed).length
    }
    const consistency = total ? Math.round((done / total) * 100) : 0

    return {
      state,
      tasksForDate,
      streak,
      consistency,
      addTask: (input) =>
        setState((s) => ({
          ...s,
          tasks: [
            ...s.tasks,
            {
              id: uid(), title: input.title.trim(), context: input.context,
              minutes: clampMinutes(input.minutes), mustDo: input.mustDo,
              completed: false, completedAt: null, createdAt: new Date().toISOString(),
              rolledFrom: null, date: input.date,
            },
          ],
        })),
      toggleTask: (id) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t
          ),
        })),
      updateTask: (id, fields) =>
        setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...fields } : t)) })),
      deleteTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
      setIntention: (date, text) => setState((s) => ({ ...s, intentions: { ...s.intentions, [date]: text } })),
      addNote: (n) =>
        setState((s) => ({
          ...s,
          notes: [
            { id: uid(), title: n.title.trim(), body: n.body, pinned: n.pinned, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ...s.notes,
          ],
        })),
      updateNote: (id, fields) =>
        setState((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, ...fields, updatedAt: new Date().toISOString() } : n)) })),
      deleteNote: (id) => setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),
      togglePin: (id) =>
        setState((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n)) })),
    }
  }, [state])

  // keep bestStreak in sync
  useEffect(() => {
    if (api.streak > state.bestStreak) setState((s) => ({ ...s, bestStreak: api.streak }))
  }, [api.streak, state.bestStreak])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used within StoreProvider')
  return v
}
