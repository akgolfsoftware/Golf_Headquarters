import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Siden finnes ikke — WANG Toppidrett Fredrikstad Golf",
  robots: { index: false, follow: false },
};

/**
 * 404 under /team-wang/* i wang.no-stilen (beslutninger.md §WANG-TRENERFLATEN
 * FØLGER STILEN PÅ WANG.NO): Montserrat, firkantede hjørner, vinrød hovedknapp.
 * Ingen data og ingen tilgangssjekk; AK Golfs 404 gjelder ikke her.
 */
export default function TeamWangIkkeFunnet() {
  return (
    <div className="wg-shell">
      <aside className="wg-side" aria-hidden />
      <div className="wg-main">
        <main className="wg-body">
          <section className="wg-kort wg-fyll" style={{ maxWidth: 560 }}>
            <p className="wg-dato">404</p>
            <h1 className="wg-tittel" style={{ fontSize: 24 }}>Siden finnes ikke</h1>
            <p className="wg-forklar">Adressen kan være skrevet feil, eller siden er flyttet.</p>
            <div className="wg-knapper">
              <Link href="/team-wang/coach" className="wg-btn wg-btn-primary">Til trenerflaten</Link>
              <Link href="/team-wang" className="wg-btn wg-btn-secondary">Til fellessiden</Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
