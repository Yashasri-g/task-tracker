/**
 * Cross-platform Notification and Audio Chime Utilities
 * Supports both Web Browsers and Electron desktop packaging
 */

export type NotificationSound = 'bell' | 'desk-bell' | 'urgent-alert';

export function getSavedNotificationSound(): NotificationSound {
  if (typeof window === 'undefined') return 'bell';
  try {
    const s = localStorage.getItem('cmd_center_notification_sound') as NotificationSound;
    if (s === 'bell' || s === 'desk-bell' || s === 'urgent-alert') return s;
  } catch {}
  return 'bell';
}

export function setSavedNotificationSound(sound: NotificationSound) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cmd_center_notification_sound', sound);
  } catch {}
}

/**
 * Creates a resonant, metallic bell strike with inharmonic partials
 */
function strikeBell(
  ctx: AudioContext,
  destination: AudioNode,
  startTime: number,
  fundamentalFreq: number,
  volume: number,
  duration: number
) {
  // Acoustic bell partials (fundamental, octave, tierce, metallic rim, shimmer)
  const partials = [
    { ratio: 1.0, gain: 0.60, decayRatio: 1.0, wave: 'sine' as OscillatorType },
    { ratio: 2.0, gain: 0.35, decayRatio: 0.8, wave: 'sine' as OscillatorType },
    { ratio: 2.76, gain: 0.28, decayRatio: 0.6, wave: 'triangle' as OscillatorType },
    { ratio: 4.07, gain: 0.18, decayRatio: 0.4, wave: 'triangle' as OscillatorType },
    { ratio: 5.42, gain: 0.10, decayRatio: 0.25, wave: 'triangle' as OscillatorType },
  ];

  partials.forEach(({ ratio, gain, decayRatio, wave }) => {
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = wave;
      osc.frequency.setValueAtTime(fundamentalFreq * ratio, startTime);

      const strikePeak = Math.max(0.0001, volume * gain);
      const ringDuration = duration * decayRatio;

      // Instant physical hammer strike attack
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.linearRampToValueAtTime(strikePeak, startTime + 0.003);
      // Resonant exponential decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + ringDuration);

      osc.connect(gainNode);
      gainNode.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + ringDuration + 0.05);
    } catch (err) {
      console.warn('Error scheduling bell partial:', err);
    }
  });
}

/**
 * Play a loud, clear, high-attention bell sound using Web Audio API synthesis
 */
export function playNotificationChime(soundType?: NotificationSound) {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Dynamics compressor for punch, volume boost, and clipping protection
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, ctx.currentTime);
    compressor.knee.setValueAtTime(8, ctx.currentTime);
    compressor.ratio.setValueAtTime(8, ctx.currentTime);
    compressor.attack.setValueAtTime(0.001, ctx.currentTime);
    compressor.release.setValueAtTime(0.2, ctx.currentTime);

    // Master volume booster
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime); // High clear volume

    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;
    const selectedSound = soundType || getSavedNotificationSound();

    if (selectedSound === 'desk-bell') {
      // Single bright reception/desk bell ("DING!")
      strikeBell(ctx, compressor, now, 1280, 0.95, 1.8);
    } else if (selectedSound === 'urgent-alert') {
      // Triple rising alert chimes
      strikeBell(ctx, compressor, now, 880, 0.75, 0.8);
      strikeBell(ctx, compressor, now + 0.12, 1174.66, 0.85, 0.9);
      strikeBell(ctx, compressor, now + 0.24, 1567.98, 0.95, 1.4);
    } else {
      // Default: Crisp, double metallic bell ("DING-DING!")
      // Strike 1: A5 (880 Hz)
      strikeBell(ctx, compressor, now, 880, 0.8, 0.9);
      // Strike 2: High E6 (1318.5 Hz) - bright attention ringer
      strikeBell(ctx, compressor, now + 0.16, 1318.51, 0.95, 1.5);
    }
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
}

export function hasNotificationSupport(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!hasNotificationSupport()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!hasNotificationSupport()) return false;
  try {
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
}

export function sendSystemNotification(title: string, options?: NotificationOptions) {
  playNotificationChime();

  if (!hasNotificationSupport()) return;
  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: true, // We already play our rich executive bell
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('Failed to send desktop notification:', err);
    }
  }
}
