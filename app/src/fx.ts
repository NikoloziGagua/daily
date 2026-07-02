import confetti from 'canvas-confetti'

// Subtle haptic feedback on supported devices (no-op elsewhere).
export function haptic(pattern: number | number[] = 12) {
  try {
    const n = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }
    n.vibrate?.(pattern)
  } catch {
    /* ignore */
  }
}

// Earned celebration — fired when the day is fully complete.
// Cooldown so overlapping triggers (e.g. Focus mode finishing the day while the
// Today screen watches the same list) can't stack into confetti spam.
let lastCelebrate = 0
export function celebrate() {
  const now = Date.now()
  if (now - lastCelebrate < 1500) return
  lastCelebrate = now
  try {
    const colors = ['#9C7A57', '#C2683F', '#5F9468', '#1A1A18', '#D8C4A8']
    confetti({ particleCount: 70, spread: 62, startVelocity: 42, origin: { y: 0.4 }, colors, scalar: 0.9, ticks: 150 })
    setTimeout(() => confetti({ particleCount: 40, spread: 90, origin: { x: 0.2, y: 0.5 }, colors, scalar: 0.8, ticks: 140 }), 120)
    setTimeout(() => confetti({ particleCount: 40, spread: 90, origin: { x: 0.8, y: 0.5 }, colors, scalar: 0.8, ticks: 140 }), 220)
    haptic([14, 40, 14])
  } catch {
    /* ignore */
  }
}
