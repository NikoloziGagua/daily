---
name: premium-app-ui
description: >
  Build polished, premium mobile/web app UIs in the user's preferred "Warm Bento"
  style — a bento-grid dashboard on a warm-paper + ink + indigo palette, SF/Inter
  type, soft floating shadows, a frosted-glass floating tab bar, framer-motion
  spring animations, NumberFlow animated stats, and gesture interactions (swipe to
  complete/delete, a Focus-mode swipe deck), plus confetti + haptics for delight.
  Use this for ANY request to make an app look "cool / premium / clean / minimal /
  floaty / modern", to restyle an app, or to build a new app screen/dashboard.
---

# Premium App UI — the "Warm Bento" design system

The signature look the user likes. Default to this whenever building or restyling
app UI unless they ask for a specific different style. It reads as calm, premium,
and alive — not flashy.

## One-line aesthetic
Warm off-white "paper" canvas · charcoal "ink" text · a single restrained indigo
accent · big soft floating shadows · bento tiles · spring motion everywhere.

## DO / DON'T (hard-won preferences)
- DO: warm paper background, white tiles, generous whitespace, soft diffused
  shadows so cards *float*, one accent used sparingly, animated numbers, spring
  physics, gesture interactions, a frosted floating tab bar, a dark "Up Next" /
  hero card for contrast.
- DON'T: full-bleed gradients everywhere, neon glow, heavy glassmorphism on every
  card, confetti on every action, an all-dark theme by default, washed-out
  same-color inputs, or one long stacked list of identical cards ("card soup").
- The user dislikes plain/boring layouts. Bento + a focal "Up Next" tile + a
  hero with a subtle animated aura is the baseline that worked.

## Default frontend stack — ALWAYS use these
This is the standing dependency stack for ANY frontend/UI work (this project or a
new one). Reach for these by default rather than hand-rolling CSS/animations:

```bash
# core
npm i react react-dom
npm i -D vite @vitejs/plugin-react typescript tailwindcss postcss autoprefixer
# motion · icons · animated numbers · delight
npm i framer-motion lucide-react @number-flow/react canvas-confetti
# add when the UI needs richer gestures / drag-reorder
npm i @use-gesture/react @dnd-kit/core @dnd-kit/sortable
```

- **Vite + React + TypeScript + Tailwind** — base build (static; `base: './'` for
  subpath hosting like GitHub Pages `/repo/`).
- **framer-motion** (Motion) — springs, layout/`layoutId`, `AnimatePresence`,
  `drag`, `useMotionValue`/`useTransform`. Use it instead of hand-written CSS
  keyframes for anything interactive.
- **lucide-react** — icon set (never inline ad-hoc SVGs when a lucide icon fits).
- **@number-flow/react** — every stat/counter/percentage animates.
- **canvas-confetti** — earned celebration only (e.g. a day/goal completed).
- **@use-gesture/react** + **@dnd-kit** — swipe/drag/reorder gestures.
- Optional flair when asked: `@paper-design/shaders-react` (liquid/aurora),
  Aceternity/React Bits components, `lottie-react`.

Rule of thumb: if a polished library exists for it (motion, icons, numbers,
gestures, charts), use the library — don't reinvent it in raw CSS/JS.

## Design tokens (Tailwind `theme.extend`)
```js
colors: {
  paper: '#F4F3EF', paper2: '#ECEBE5', card: '#FFFFFF',
  ink: '#191917', sub: '#6E6E68', faint: '#A6A69E',
  line: 'rgba(25,25,23,0.07)',
  accent: '#4F46E5', accentSoft: 'rgba(79,70,229,0.10)',
  flame: '#F0612B', ok: '#1FA463',
}
boxShadow: {
  tile: '0 1px 2px rgba(25,25,23,.04), 0 6px 22px rgba(25,25,23,.05)',
  pop:  '0 10px 34px rgba(25,25,23,.12)',
}
borderRadius: { tile: '24px', sheet: '32px' }
fontFamily.sans: ['-apple-system','BlinkMacSystemFont','"SF Pro Text"','Inter','sans-serif']
```
- Type: large titles `text-[32px] font-extrabold tracking-[-0.03em]`; section
  labels `text-[12-13px] uppercase tracking-wide text-sub font-semibold`; body 15–17px.
- Easings: spring `{ type:'spring', stiffness:300, damping:26 }`; smooth
  `cubic-bezier(.22,.61,.36,1)`; bouncy `cubic-bezier(.34,1.4,.5,1)`.
- Hairlines: `0.5px solid rgba(25,25,23,.08)`.
- Respect `prefers-reduced-motion` and iOS safe-area insets (`env(safe-area-inset-*)`).

## Layout patterns
- **Phone column**: center everything in `max-w-[500px]`; full-height flex column
  with a scrollable `<main>` and a floating tab bar.
- **Bento grid** (the hero pattern): `grid grid-cols-2 gap-3`; full-width tiles use
  `col-span-2`. Tile = `bg-card rounded-tile shadow-tile p-5`. Stagger tiles in
  with `variants` + `staggerChildren: 0.06` and a spring `item` variant.
- **Hero tile**: progress ring + copy + a subtle animated indigo aura behind it
  (`blur-3xl`, looping scale/opacity). Add a faint **film grain** overlay
  (SVG `feTurbulence`, `opacity-[0.04] mix-blend-multiply`) across the app for depth.
- **"Up Next" / focal card**: dark `bg-ink text-white` tile that surfaces the single
  most important item with a one-tap action button — the contrast anchor.
- **Inset grouped list**: rows inside one `bg-card rounded-tile` container with
  inset `0.5px` hairline separators (`left-[52px]`), not a card per row.
- **Floating glass tab bar**: detached pill, `bg-white/65 backdrop-blur-2xl
  border border-white/70 shadow-pop`, active tab is an ink lozenge that slides via
  shared `layoutId="tabpill"`.
- **Bottom sheets** for add/edit (drag handle, spring up, dimmed backdrop) — the
  2026-default container for secondary actions.
- **Large iOS titles** with a greeting/subtitle; quiet uppercase section labels.

## Signature components
- **ProgressRing**: SVG circle, accent `#4F46E5` stroke on `#ECEBE5` track, animate
  `strokeDashoffset` with a spring; center shows `<NumberFlow value={pct}/>%`.
- **Stat tile**: small icon chip (soft-tinted circle) + `<NumberFlow>` big number +
  label. Streak=flame, consistency=sparkles, etc.
- **Swipeable row** (key interaction): `motion.div drag="x" dragSnapToOrigin
  dragDirectionLock`; reveal `bg-ok` (complete) left and `bg-[#FF3B30]` (delete)
  right behind it; on `onDragEnd` act past ±96px; fire `haptic()`. Circular check
  fills accent with a spring-scaled checkmark.
- **Focus mode**: full-screen swipe **deck** of remaining tasks — one big card at a
  time, `drag="x"` with throw, swipe right=done / left=skip, progress segments,
  `celebrate()` confetti when the deck empties. Launch from the Up-Next card.
- **FAB**: `bg-ink` circle, `shadow-pop`, `whileTap={{scale:.88}}`, sits above the
  floating tab bar; opens the add bottom sheet.

## Motion & delight
- Everything springs; press states `active:scale-90` / `whileTap`.
- `haptic(ms=12)` → `navigator.vibrate?.()` on completes, adds, tab switches.
- `celebrate()` → `canvas-confetti` ONLY on earning it (day cleared). Colors:
  `['#4F46E5','#F0612B','#1FA463','#191917']`.
- Screen/tab changes cross-fade/slide via `AnimatePresence mode="wait"`.

## Build checklist
1. Scaffold Vite+React+TS+Tailwind; add framer-motion, lucide-react,
   @number-flow/react, canvas-confetti. Set `base:'./'`.
2. Put tokens in `tailwind.config.js`; paper bg + grain + reduced-motion in CSS.
3. Real state in a store (e.g. context + `localStorage`); no mock-only screens.
4. Build screens as bento; add the Up-Next focal card, inset lists, floating glass
   tab bar, bottom-sheet add/edit.
5. Add swipe rows, Focus mode, haptics, confetti.
6. Verify the production build in a headless browser (Playwright at 390×844):
   load with zero console errors, then test a swipe and a sheet before shipping.
7. For static hosting, build then place `index.html` + `assets/` at the served
   root; use a network-first service worker (no hashed-asset precache).

## Liked alternate variants (offer when they want a different vibe)
- **Air** — ultra-minimal: one thin floating ring, max whitespace, floating pill nav.
- **Editorial** — serif display (Fraunces), hairline rules, quiet typographic lists.
- **Activity Rings** — concentric Apple-Fitness rings as the hero (tasks/must-do/focus).
- **Liquid Glass** — translucent refractive cards over a soft drifting color field
  (offer as a theme, not the default).

When in doubt: warm paper, ink text, one indigo accent, floaty soft shadows, bento
layout, spring motion, a dark focal card, and a frosted floating tab bar.
