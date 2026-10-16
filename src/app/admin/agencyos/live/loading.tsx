/* Ren serverkomponent uten import: loading.tsx importerer aldri fra en
   "use client"-modul (CSP-nonce, gotchas §Bygg og drift). Heller ikke pa.tsx,
   som drar med next/link, eller stilark — begge gir en skriptfil Next skriver
   uten nonce. Markeringen er LasterTilstand fra pa.tsx; stilarkene ligger i
   live/layout.tsx. */

export default function Loading() {
  return (
    <div className="pa-root" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)" }}>
      <div className="pa-side">
        <div className="pa-state pa-state--loading" role="status" aria-live="polite"><span className="pa-state__mono">Kobler til pågående økter …</span></div>
      </div>
    </div>
  );
}
