const KEY = "typingfall_guest_progress";
const TTL_MS = 20 * 60 * 1000;

export function loadGuestProgressFall() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { maxCompleted: 0 };
    const obj = JSON.parse(raw);
    const expired = !obj.updatedAt || Date.now() - obj.updatedAt > TTL_MS;
    if (expired) {
      localStorage.removeItem(KEY);
      const data = { maxCompleted: 0, updatedAt: Date.now() };
      window.dispatchEvent(
        new CustomEvent("typingfall:progress", { detail: data }),
      );
      return { maxCompleted: 0 };
    }
    return { maxCompleted: Number(obj.maxCompleted || 0) };
  } catch {
    localStorage.removeItem(KEY);
    return { maxCompleted: 0 };
  }
}

export function saveGuestProgressFall(levelJustCleared) {
  const raw = localStorage.getItem(KEY);
  const obj = raw ? JSON.parse(raw) : { maxCompleted: 0, updatedAt: 0 };
  const maxCompleted = Math.max(
    Number(obj.maxCompleted || 0),
    Number(levelJustCleared || 0),
  );
  const data = { maxCompleted, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(
    new CustomEvent("typingfall:progress", { detail: data }),
  );
}

export function resetGuestProgressFall() {
  localStorage.removeItem(KEY);
  const data = { maxCompleted: 0, updatedAt: Date.now() };
  window.dispatchEvent(
    new CustomEvent("typingfall:progress", { detail: data }),
  );
}
