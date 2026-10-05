export function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function ordinal(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${n}${ordinalSuffix(n)}`;
}

export function formatUpdated(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Compute the next occurrence of a day-of-month, starting from `today`.
// If the day has already passed this month, returns next month's.
export function nextDateForDay(day: number | null, today: Date = new Date()): Date | null {
  if (day == null) return null;
  const y = today.getFullYear();
  const m = today.getMonth();
  let target = new Date(y, m, day);
  // Compare by calendar day, not exact time — if today IS the deposit day, show today.
  const todayMidnight = new Date(y, m, today.getDate());
  if (target < todayMidnight) target = new Date(y, m + 1, day);
  return target;
}
