// Lasting for trenerflaten (pakke 2, tilstanden «laster» i utkast-wang/idag.html).
// Ren serverkode: ingen "use client"-moduler, heller ikke next/link eller next/image
// (gotchas §Bygg og drift, CSP-nonce). Skallets sidemeny vises som tom flate.
export default function WangCoachLaster() {
  return (
    <div className="wg-shell">
      <aside className="wg-side" aria-hidden />
      <div className="wg-main">
        <main className="wg-body" aria-busy="true">
          <p className="wg-kilde" role="status">Henter dagen …</p>
          <span className="wg-skjelett" style={{ height: 36, width: "40%" }} />
          <span className="wg-skjelett" style={{ height: 220 }} />
          <span className="wg-skjelett" style={{ height: 72 }} />
          <span className="wg-skjelett" style={{ height: 320 }} />
        </main>
      </div>
    </div>
  );
}
