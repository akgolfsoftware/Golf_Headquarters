"use client";

/**
 * PlayerHQ Turneringer (/portal/tren/turneringer) — nytt design, pakke 17 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan-hjelpere.html, skjermen «Turneringer».
 * Handlingene er uendret: «Legg i planen» kaller leggTilTurnering (prioritet B), turneringen åpnes for
 * påmelding og prioritet. Påmelding skjer aldri fra lista (spilleransvar, vedtak 28.09).
 *
 * Avvik:
 *   - «Neste turnering» er den første i GolfBox-kalenderen fra i dag (vedtak 28.09: neste offisielle).
 *     Interne konkurranser står ikke her. Mangler kalenderen, vises «—».
 *   - Filteret bruker touren fra GolfBox (for eksempel Junior Tour), ikke «Junior / Åpen».
 *   - «Synket i dag 06:00» vises ikke: synketidspunktet lagres ikke på turneringen.
 *   - «Legg i planen» legger ikke inn reisedager; det gjør du i Plan.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { leggTilTurnering } from "@/app/portal/(legacy)/tren/turneringer/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-plan-hjelpere.css";

export type PHTurneringRad = {
  id: string; navn: string; dag: string; mnd: string; dato: string; sted: string | null; tour: string | null;
  frist: string | null; fristHaster: boolean; tier: "A" | "B" | "C" | null; status: string | null;
};
export type PHTurneringerData = {
  neste: { id: string; navn: string; uker: number; sted: string | null; dato: string; frist: string | null } | null;
  mine: PHTurneringRad[];
  katalog: PHTurneringRad[];
};

function Rad({ t, min }: { t: PHTurneringRad; min?: boolean }) {
  return <Link className={`ph-turn${min ? " min" : ""}`} href={`/portal/tren/turneringer/${t.id}`}>
    <span className="dato" aria-hidden>{t.dag}<small>{t.mnd}</small></span>
    <span><b>{t.navn}</b><span className="phn-kilde">{[t.sted, t.status, t.frist ? `frist ${t.frist}` : null].filter(Boolean).join(" · ") || t.dato}</span></span>
    {min ? <span className="ph-tier" aria-label={`Prioritet ${t.tier ?? "—"}`}>{t.tier ?? "—"}</span> : <ChevronRight size={20} aria-hidden />}
  </Link>;
}

export function PHTurneringer({ data }: { data: PHTurneringerData }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [jobber, start] = useTransition();
  const tourer = useMemo(() => {
    const telt = new Map<string, number>();
    for (const t of data.katalog) if (t.tour) telt.set(t.tour, (telt.get(t.tour) ?? 0) + 1);
    return [...telt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [data.katalog]);
  const katalog = filter ? data.katalog.filter((t) => t.tour === filter) : data.katalog;

  function leggTil(id: string) {
    setFeil(null);
    start(async () => {
      const r = await leggTilTurnering({ tournamentId: id, priority: "NORMAL", planTier: "B" });
      if (!r.ok) setFeil(r.feil);
      else router.refresh();
    });
  }

  return <div className="phn phn-meg phn-ph"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/planlegge"><ChevronLeft size={18} aria-hidden />Plan</Link>
      <div><div className="phn-dato">Plan · turneringer</div><h1 className="phn-tittel">Turneringer</h1></div>
    </div>
    <div className="to-del">
      <div>
        <section className="phn-kort" aria-label="Neste turnering">
          {data.neste
            ? <>
              <div className="phn-hoved"><strong>{data.neste.uker}</strong><span className="phn-forklar">{data.neste.uker === 1 ? "uke" : "uker"} til {data.neste.navn}</span></div>
              <p className="phn-forklar">{[data.neste.sted, data.neste.dato].filter(Boolean).join(", ")}.{data.neste.frist ? ` Påmeldingsfristen er ${data.neste.frist}.` : ""}</p>
              <div className="phn-knapper"><Link className="phn-knapp sek" href={`/portal/tren/turneringer/${data.neste.id}`}>Åpne turneringen</Link></div>
            </>
            : <><div className="phn-hoved"><strong>—</strong><span className="phn-forklar">ingen kommende turnering i kalenderen</span></div></>}
          <p className="phn-kilde">Neste offisielle turnering · fra GolfBox</p>
        </section>
        <section className="phn-seksjon" aria-labelledby="ph-mine">
          <div className="phn-sek-topp"><h2 id="ph-mine">Dine turneringer</h2><span className="phn-kilde">{data.mine.length} i planen</span></div>
          {data.mine.length === 0
            ? <div className="phn-kort dempet"><b className="phn-undertittel">Ingen turneringer i planen ennå</b><p className="phn-forklar">Legg til fra kalenderen. Prioritet A, B eller C styrer nedtrappingen før turneringen.</p></div>
            : <div className="ph-turn-liste">{data.mine.map((t) => <Rad key={t.id} t={t} min />)}</div>}
        </section>
      </div>
      <div>
        <section className="phn-seksjon" aria-labelledby="ph-kal">
          <div className="phn-sek-topp"><h2 id="ph-kal">Kalenderen</h2><span className="phn-kilde">Fra GolfBox</span></div>
          {tourer.length > 1 && <div className="ph-chips" role="group" aria-label="Filter">
            <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>Alle <b>{data.katalog.length}</b></button>
            {tourer.map(([tour, n]) => <button key={tour} type="button" aria-pressed={filter === tour} onClick={() => setFilter(tour)}>{tour} <b>{n}</b></button>)}
          </div>}
          {feil && <div className="ph-melding" role="alert">{feil}</div>}
          {katalog.length === 0
            ? <div className="phn-kort dempet"><b className="phn-undertittel">Ingen turneringer i kalenderen</b><p className="phn-forklar">Kalenderen hentes fra GolfBox. Kommende turneringer vises her.</p></div>
            : <div className="ph-turn-liste">{katalog.map((t) => <div key={t.id} className="ph-turn-rad">
              <Rad t={t} />
              {t.tier ? <span className="phn-pille ok"><i />I planen</span> : <button type="button" className="ph-legg" disabled={jobber} onClick={() => leggTil(t.id)}><Plus size={16} aria-hidden style={{ verticalAlign: "-3px" }} /> Legg i planen</button>}
            </div>)}</div>}
        </section>
      </div>
    </div>
  </div></div>;
}
