export interface NotificationPrefs {
  soundEnabled: boolean;
  visualEnabled: boolean;
  browserNotifications: boolean;
}

export const NOTIFICATION_PREFS_KEY = "ai-peak-monitor-notification-prefs";

const DEFAULT_PREFS: NotificationPrefs = {
  soundEnabled: true,
  visualEnabled: true,
  browserNotifications: false,
};

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const data = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!data) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function playNotificationSound(): void {
  if (typeof window === "undefined") return;
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // First tone: 880Hz, 100ms
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.1);

    // Second tone: 660Hz, 100ms (after first)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, audioCtx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.12);
    osc2.stop(audioCtx.currentTime + 0.22);
  } catch {}
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function sendBrowserNotification(title: string, body: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  } catch {}
}
