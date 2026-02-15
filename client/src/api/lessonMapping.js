export async function fetchLessonCharMap() {
  const res = await fetch("/api/typing/analysis/map_chars");
  if (!res.ok) return {};
  return await res.json();
}
