// Subtle haptic feedback for touch confirmations. No-op on devices/browsers
// that don't support the Vibration API (e.g. desktop, iOS Safari).
export function haptic(pattern: number | number[] = 10) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore — haptics are a non-critical enhancement
  }
}
