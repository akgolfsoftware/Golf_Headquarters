"use client";

// Feil i trenerflaten (pakke 2, tilstanden «feil» i utkast-wang/idag.html), i wang.no-stilen.
// Fellessiden /team-wang har sin egen feilside (src/app/team-wang/error.tsx).
export default function WangCoachFeil({ reset }: { reset: () => void }) {
  return (
    <div className="wg-shell">
      <aside className="wg-side" aria-hidden />
      <div className="wg-main">
        <main className="wg-body">
          <section className="wg-kort wg-fyll" role="alert" style={{ maxWidth: 560 }}>
            <h1 className="wg-tittel" style={{ fontSize: 24 }}>Dagen kunne ikke hentes</h1>
            <p className="wg-forklar">Vi fikk ikke kontrollert tilgangen eller hentet gruppas data. Ingenting er endret.</p>
            <div className="wg-knapper">
              <button type="button" className="wg-btn wg-btn-primary" onClick={reset}>
                Prøv igjen
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
