const KEY = "typing_lesson_guest_progress";
const TTL_MS = 20 * 60 * 1000;

export function loadGuestTypingProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { nextGlobal: 1 };

    const obj = JSON.parse(raw);
    const expired = !obj.updatedAt || Date.now() - obj.updatedAt > TTL_MS;

    if (expired) {
      localStorage.removeItem(KEY);
      const data = { nextGlobal: 1, updatedAt: Date.now() };
      window.dispatchEvent(
        new CustomEvent("typinglesson:progress", { detail: data }),
      );
      return data;
    }

    return { nextGlobal: Number(obj.nextGlobal || 1) };
  } catch {
    localStorage.removeItem(KEY);
    return { nextGlobal: 1 };
  }
}

export function saveGuestTypingProgress(globalIndexCleared) {
  const raw = localStorage.getItem(KEY);
  const obj = raw ? JSON.parse(raw) : { nextGlobal: 1, updatedAt: 0 };

  const nextGlobal = Math.max(
    Number(obj.nextGlobal || 1),
    Number(globalIndexCleared || 1),
  );

  const data = { nextGlobal, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(data));

  window.dispatchEvent(
    new CustomEvent("typinglesson:progress", { detail: data }),
  );
}

export function resetGuestTypingProgress() {
  localStorage.removeItem(KEY);
  const data = { nextGlobal: 1, updatedAt: Date.now() };
  window.dispatchEvent(
    new CustomEvent("typinglesson:progress", { detail: data }),
  );
}
