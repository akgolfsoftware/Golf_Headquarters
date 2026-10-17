"use client";

/**
 * PlayerHQ Hjelp (/portal/meg/help) — nytt design, pakke 15 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/hjelp.html, skjermen «Hjelp».
 * Søket leter i publiserte artikler og vanlige spørsmål samtidig. Artiklene kommer fra
 * src/lib/portal-hjelp/artikler.ts (skrevet etter hjelpeartikler.md).
 *
 * Avvik:
 *   - Antallet artikler telles fra de publiserte artiklene; en artikkel som venter på funksjonen den
 *     beskriver, vises ikke (TrackMan-importen).
 *   - Kategorien Trening er fylt i TEK-farge som i utkastet; de andre er hvite.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Dumbbell, MessageSquare, Rocket, Search, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { HJELP_FAQ, HJELP_KATEGORIER, artikkelTekst, publiserteArtikler, type HjelpKategoriSlug } from "@/lib/portal-hjelp/artikler";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-hjelp.css";

const IKON: Record<HjelpKategoriSlug, ReactNode> = {
  "komme-i-gang": <Rocket size={18} />, trening: <Dumbbell size={18} />, coaching: <MessageSquare size={18} />,
  booking: <CalendarDays size={18} />, konto: <ShieldCheck size={18} />, statistikk: <BarChart3 size={18} />,
};

export function PHHjelp() {
  const [sok, setSok] = useState("");
  const artikler = publiserteArtikler();
  const q = sok.trim().toLowerCase();
  const treff = useMemo(() => {
    if (!q) return null;
    const a = artikler.filter((x) => artikkelTekst(x).toLowerCase().includes(q)).map((x) => ({ type: "artikkel" as const, x }));
    const f = HJELP_FAQ.filter((x) => `${x.sporsmal} ${x.svar}`.toLowerCase().includes(q)).map((x) => ({ type: "faq" as const, x }));
    return [...a, ...f];
  }, [q, artikler]);

  return <div className="phn phn-meg phn-hjelp"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link>
      <div><div className="phn-dato">Meg · hjelp</div><h1 className="phn-tittel">Hjelp</h1></div>
      <label className="hj-sok"><Search size={20} aria-hidden /><input type="search" placeholder="Søk i hjelpen, f.eks. «klipp»" aria-label="Søk i hjelpen" value={sok} onChange={(e) => setSok(e.target.value)} /></label>
    </div>
    <div className="hj-grid">
      <div>
        {treff
          ? <section className="phn-seksjon" aria-labelledby="hj-treff">
            <div className="phn-sek-topp"><h2 id="hj-treff">Treff</h2><span className="phn-kilde">{treff.length} treff</span></div>
            {treff.length === 0
              ? <div className="phn-kort dempet"><b className="phn-undertittel">Ingen treff på «{sok.trim()}»</b><p className="phn-forklar">Prøv et annet ord, eller skriv til oss.</p></div>
              : <div className="liste">{treff.map((t) => t.type === "artikkel"
                ? <Link key={t.x.slug} href={`/portal/meg/help/artikkel/${t.x.slug}`}><span className="ikonboks" aria-hidden>{IKON[t.x.kategori]}</span><span><b>{t.x.tittel}</b><span className="phn-kilde">Artikkel · {t.x.lesetid} min lesing</span></span><ChevronRight size={20} aria-hidden /></Link>
                : <div key={t.x.sporsmal}><span className="ikonboks" aria-hidden><MessageSquare size={18} /></span><span><b>{t.x.sporsmal}</b><span className="phn-kilde">{t.x.svar}</span></span><span /></div>)}
              </div>}
          </section>
          : <section className="phn-seksjon" aria-labelledby="hj-kat">
            <div className="phn-sek-topp"><h2 id="hj-kat">Kategorier</h2><span className="phn-kilde">{HJELP_KATEGORIER.length} kategorier · {artikler.length} artikler</span></div>
            <div className="hj-kat-grid">
              {HJELP_KATEGORIER.map((k) => <Link key={k.slug} className={`hj-kat${k.slug === "trening" ? " tek" : ""}`} href={`/portal/meg/help/kategori/${k.slug}`}>
                <span className="ikonboks" aria-hidden>{IKON[k.slug]}</span><b>{k.tittel}</b><span className="phn-kilde">{k.kort}</span>
              </Link>)}
            </div>
          </section>}
      </div>
      <div>
        <section className="phn-seksjon" aria-labelledby="hj-faq">
          <div className="phn-sek-topp"><h2 id="hj-faq">Vanlige spørsmål</h2></div>
          <div className="hj-faq">{HJELP_FAQ.map((f, i) => <details key={f.sporsmal} open={i === 0}><summary>{f.sporsmal}<ChevronDown size={20} aria-hidden /></summary><p>{f.svar}</p></details>)}</div>
        </section>
        <div className="phn-kort dempet">
          <div className="hj-skriv"><span className="ikonboks" aria-hidden><MessageSquare size={20} /></span><span><b className="phn-undertittel">Fant du ikke svaret?</b><p className="phn-forklar">Skriv til oss om spørsmål, feil eller forslag. Svaret kommer på e-post.</p></span></div>
          <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/meg/help/kontakt">Skriv til oss</Link></div>
        </div>
      </div>
    </div>
  </div></div>;
}
