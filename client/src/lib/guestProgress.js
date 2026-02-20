const KEY = "spelling_guest_progress";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function loadGuestProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { maxCompleted: 0 };
    const obj = JSON.parse(raw);

    const expired = !obj.updatedAt || Date.now() - obj.updatedAt > TTL_MS;
    if (expired) {
      localStorage.removeItem(KEY);
      const data = { maxCompleted: 0, updatedAt: Date.now() };
      window.dispatchEvent(
        new CustomEvent("spelling:progress", { detail: data }),
      );
      return { maxCompleted: 0 };
    }

    return { maxCompleted: Number(obj.maxCompleted || 0) };
  } catch {
    localStorage.removeItem(KEY);
    return { maxCompleted: 0 };
  }
}

export function saveGuestProgress(maxCompleted) {
  const data = {
    maxCompleted: Number(maxCompleted || 0),
    updatedAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("spelling:progress", { detail: data }));
}

export function resetGuestProgress() {
  localStorage.removeItem(KEY);
  const data = { maxCompleted: 0, updatedAt: Date.now() };
  window.dispatchEvent(new CustomEvent("spelling:progress", { detail: data }));
}
