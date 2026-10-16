/**
 * LasterTilstand i egen fil uten next/link: loading.tsx importerer herfra (ikke fra pa.tsx,
 * som drar inn next/link). Vakt: scripts/check-loading-server.mjs.
 */
export function LasterTilstand({ text = "Henter …" }: { text?: string }) {
  return <div className="pa-state pa-state--loading" role="status" aria-live="polite"><span className="pa-state__mono">{text}</span></div>;
}
