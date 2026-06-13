// ─────────────────────────────────────────────────────────────────────────────
// HAPTICS UTILITY
// Capacitor on native, Navigator.vibrate fallback on web.
// Used throughout the cinematic scenes at key ritual moments.
// ─────────────────────────────────────────────────────────────────────────────

export type HapticStyle = 'light' | 'medium' | 'heavy';

const WEB_DURATIONS: Record<HapticStyle, number> = {
  light: 8,
  medium: 14,
  heavy: 24,
};

export async function haptic(style: HapticStyle = 'medium'): Promise<void> {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(WEB_DURATIONS[style]);
  }
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const map: Record<HapticStyle, any> = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: map[style] });
  } catch {
    // Web-only — vibrate fallback already fired
  }
}

/** Distinct pattern for the "unlock" moment — short, then a confirming pulse */
export async function hapticUnlockSequence(): Promise<void> {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([10, 60, 18]);
  }
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Light }), 250);
  } catch {
    // Web fallback already fired
  }
}
