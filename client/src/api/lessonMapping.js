export async function fetchLessonCharMap() {
  const API_BASE = `${import.meta.env.VITE_API_URL}/api/typing`;
  const res = await fetch(`${API_BASE}/analysis/map_chars`);
  if (!res.ok) return {};
  return await res.json();
}
