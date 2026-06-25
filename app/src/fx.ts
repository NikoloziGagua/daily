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
export function celebrate() {
  try {
    const colors = ['#4F46E5', '#F0612B', '#1FA463', '#191917', '#9b9bf0']
    confetti({ particleCount: 70, spread: 62, startVelocity: 42, origin: { y: 0.4 }, colors, scalar: 0.9, ticks: 150 })
    setTimeout(() => confetti({ particleCount: 40, spread: 90, origin: { x: 0.2, y: 0.5 }, colors, scalar: 0.8, ticks: 140 }), 120)
    setTimeout(() => confetti({ particleCount: 40, spread: 90, origin: { x: 0.8, y: 0.5 }, colors, scalar: 0.8, ticks: 140 }), 220)
    haptic([14, 40, 14])
  } catch {
    /* ignore */
  }
}
