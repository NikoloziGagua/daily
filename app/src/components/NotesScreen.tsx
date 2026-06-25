import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Pin, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Note } from '../types'
import { fmtRelative } from '../util'

function NoteCard({ note, onOpen, onPin }: { note: Note; onOpen: () => void; onPin: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      onClick={onOpen} className="bg-white rounded-ios shadow-ios-sm p-4 relative active:bg-ios-gray6 transition-colors">
      <div className="flex justify-between items-start mb-1 gap-2">
        <h3 className="text-[17px] font-semibold truncate">{note.title || 'Untitled'}</h3>
        <button onClick={(e) => { e.stopPropagation(); onPin() }} className="flex-none">
          <Pin size={15} className={note.pinned ? 'text-ios-orange fill-ios-orange' : 'text-ios-tertiary'} />
        </button>
      </div>
      <p className="text-[15px] text-ios-secondary leading-snug mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {note.body || 'No additional text'}
      </p>
      <span className="text-[13px] text-ios-tertiary font-medium">{fmtRelative(note.updatedAt)}</span>
    </motion.div>
  )
}

export function NotesScreen() {
  const s = useStore()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Note | 'new' | null>(null)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return s.state.notes.filter((n) => !query || (n.title + ' ' + n.body).toLowerCase().includes(query))
  }, [s.state.notes, q])
  const pinned = filtered.filter((n) => n.pinned)
  const recent = filtered.filter((n) => !n.pinned)

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.28, ease: 'easeOut' }} className="px-4 pt-3 pb-28 space-y-5">
      <header className="px-1 flex items-end justify-between">
        <h1 className="text-[34px] font-bold tracking-[-0.5px] leading-tight">Notes</h1>
        <button onClick={() => setEditing('new')} className="text-ios-blue pb-1.5 active:scale-90 transition-transform"><Plus size={28} /></button>
      </header>

      <div className="relative px-1">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-secondary pointer-events-none" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search"
          className="w-full bg-[#E3E3E8] rounded-[10px] py-2.5 pl-10 pr-4 text-[17px] placeholder-ios-secondary outline-none" />
      </div>

      {pinned.length > 0 && (
        <section>
          <h2 className="text-[13px] uppercase tracking-wide text-ios-secondary font-medium px-4 mb-2 flex items-center gap-1.5"><Pin size={12} className="fill-ios-secondary text-ios-secondary" /> Pinned</h2>
          <div className="space-y-3"><AnimatePresence initial={false}>{pinned.map((n) => <NoteCard key={n.id} note={n} onOpen={() => setEditing(n)} onPin={() => s.togglePin(n.id)} />)}</AnimatePresence></div>
        </section>
      )}

      <section>
        {pinned.length > 0 && <h2 className="text-[13px] uppercase tracking-wide text-ios-secondary font-medium px-4 mb-2">Recent</h2>}
        {recent.length === 0 && pinned.length === 0 ? (
          <div className="bg-white rounded-ios shadow-ios-sm py-10 text-center text-[15px] text-ios-tertiary">No notes yet. Tap + to write one.</div>
        ) : (
          <div className="space-y-3"><AnimatePresence initial={false}>{recent.map((n) => <NoteCard key={n.id} note={n} onOpen={() => setEditing(n)} onPin={() => s.togglePin(n.id)} />)}</AnimatePresence></div>
        )}
      </section>

      <NoteEditor editing={editing} onClose={() => setEditing(null)} />
    </motion.div>
  )
}

function NoteEditor({ editing, onClose }: { editing: Note | 'new' | null; onClose: () => void }) {
  const s = useStore()
  const open = editing !== null
  const existing = editing && editing !== 'new' ? editing : null
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  React.useEffect(() => {
    if (open) { setTitle(existing?.title || ''); setBody(existing?.body || '') }
  }, [open, existing?.id])

  const save = () => {
    if (!title.trim() && !body.trim()) { onClose(); return }
    if (existing) s.updateNote(existing.id, { title: title.trim() || 'Untitled', body })
    else s.addNote({ title: title.trim() || 'Untitled', body, pinned: false })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={save} className="absolute inset-0 bg-black/40 z-[60]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 bg-ios-bg rounded-t-sheet z-[70] flex flex-col shadow-ios-lg" style={{ height: '88%' }}>
            <div className="w-full flex justify-center pt-3 pb-1"><div className="w-10 h-1.5 bg-ios-tertiary rounded-full" /></div>
            <div className="flex justify-between items-center px-4 py-3 ios-hairline-b">
              {existing ? (
                <button onClick={() => { s.deleteNote(existing.id); onClose() }} className="text-ios-red"><Trash2 size={20} /></button>
              ) : <button onClick={onClose} className="text-ios-blue text-[17px]">Cancel</button>}
              <h2 className="text-[17px] font-semibold">{existing ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={save} className="text-ios-blue text-[17px] font-semibold">Done</button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto hide-scrollbar flex-1 flex flex-col">
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
                className="w-full text-[22px] font-semibold bg-transparent outline-none placeholder-ios-tertiary" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Start writing…"
                className="w-full flex-1 min-h-[200px] text-[17px] bg-transparent outline-none resize-none placeholder-ios-tertiary leading-relaxed" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
