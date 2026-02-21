export function formatTimestamp(ts: string): string {
  // "20260216_024413" → "2026-02-16 02:44:13"
  if (ts.length !== 15) return ts;
  const d = ts.slice(0, 4) + "-" + ts.slice(4, 6) + "-" + ts.slice(6, 8);
  const t = ts.slice(9, 11) + ":" + ts.slice(11, 13) + ":" + ts.slice(13, 15);
  return d + " " + t;
}

export function statusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pass":
    case "passed":
      return "var(--passed)";
    case "fail":
    case "failed":
      return "var(--failed)";
    case "broken":
      return "var(--broken)";
    case "skip":
    case "skipped":
      return "var(--skipped)";
    default:
      return "var(--muted)";
  }
}

export function deriveStatus(stats: {
  failed: number;
  broken: number;
  passed: number;
  total: number;
}): string {
  if (stats.failed > 0) return "fail";
  if (stats.broken > 0) return "broken";
  if (stats.passed === stats.total) return "pass";
  return "skip";
}
