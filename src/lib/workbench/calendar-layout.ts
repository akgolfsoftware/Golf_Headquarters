/** Kolonner for visuelt overlappende kort; minimumshøyden er også med. */
export function calendarLanes(items: readonly { id: string; startMinute: number; durationMinutes: number }[], minimumMinutes = 82.5) {
  const result = new Map<string, { lane: number; count: number }>();
  const sorted = [...items].sort((a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id));
  let group: { id: string; lane: number }[] = [];
  let ends: number[] = [];
  let groupEnd = -Infinity;
  const finish = () => { for (const item of group) result.set(item.id, { lane: item.lane, count: ends.length }); };
  for (const item of sorted) {
    if (item.startMinute >= groupEnd) { finish(); group = []; ends = []; groupEnd = -Infinity; }
    let lane = ends.findIndex(end => end <= item.startMinute);
    if (lane < 0) lane = ends.length;
    const end = item.startMinute + Math.max(item.durationMinutes, minimumMinutes);
    ends[lane] = end; groupEnd = Math.max(groupEnd, end); group.push({ id: item.id, lane });
  }
  finish();
  return result;
}
