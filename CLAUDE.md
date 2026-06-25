# Daily Compass

A premium daily-planning PWA. The app is a **Vite + React + TypeScript** build in
`app/` (source) compiled to static files at the repo root, served by GitHub Pages.

## Frontend dependency stack — always use these
For all UI work in this repo (and as a general default), build with the standing
stack rather than hand-rolling CSS/animations:

- **Vite + React + TS + Tailwind** (`base: './'`).
- **framer-motion** for all motion (springs, `layoutId`, `AnimatePresence`, `drag`).
- **lucide-react** icons · **@number-flow/react** animated stats ·
  **canvas-confetti** for earned celebrations · `navigator.vibrate` haptics.
- **@use-gesture/react** / **@dnd-kit** for swipe / drag-reorder when needed.

If a polished library exists for it, use the library.

## Design language
Default look = the **"Warm Bento"** system (warm paper + ink + indigo, bento tiles,
dark "Up Next" focal card, floating glass tab bar, spring motion, swipe + Focus-mode
gestures, confetti/haptics). Full spec and component recipes are in the
`.claude/skills/premium-app-ui/` skill — use it for any styling/UI request.

## Build & deploy
- Dev: `cd app && npm i && npm run dev`.
- Ship: `cd app && npm run build`, then copy `app/dist/index.html` + `app/dist/assets/`
  to the repo root (GitHub Pages serves root with `.nojekyll`).
- Service worker is network-first (no hashed-asset precache).
