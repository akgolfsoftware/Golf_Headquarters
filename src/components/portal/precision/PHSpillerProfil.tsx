/**
 * Spillerprofil i PlayerHQ (/portal/spiller/[spillerId]) i Precision Athletics. Erstatter SpillerDetaljV2.
 * Vises for spilleren selv og for en trener spilleren har delt profilen med. En coach med spilleren i stallen
 * sendes til Spiller 360 (AG-08), som er den ene spillerprofilen (beslutninger.md §ÉN SPILLERPROFIL, 27.09).
 * Fasit: PlayerHQ-flatene i docs/design-system/utkast-playerhq/ (meg.html og stats.html). Stil: playerhq-ny.css
 * og playerhq-ny-sghub.css.
 *
 * Avvik:
 *   - Ingen egen tegning for denne siden; den følger Meg og Stats.
 *   - Fanene fra v2 (Oversikt, Plan, Statistikk, Runder, Coaching) er seksjoner på én side.
 *   - Rundene er en liste, ikke en tabell som ruller sidelengs.
 */
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-sghub.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke9-skra.css";

export type PHSpillerProfilData = {
  id: string;
  navn: string;
  hcp: number | null;
  homeClub: string | null;
  playingYears: number | null;
  ambition: string | null;
  memberSince: string;
  runder: { id: string; score: number; relativ: number; kursNavn: string; playedAt: string; sgTotal: number | null; sgPutt: number | null; sgOtt: number | null; sgApp: number | null; sgArg: number | null }[];
  aktivPlan: { id: string; name: string } | null;
  coachingHistorikk: { id: string; scheduledAt: string; type: string; coachNavn: string }[];
  mal: { id: string; title: string; pct: number | null; deadline: string | null }[];
  stats: { antallRunder: number; snittScore: number | null; sgSnitt: number | null; antallOkter: number };
};

const dato = (iso: string) => new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Oslo" });
const sg = (v: number | null) => (v === null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${formaterTall(Math.abs(v), 2, true)}`);
const relativ = (r: number) => (r === 0 ? "E" : r > 0 ? `+${r}` : `−${-r}`);
const KIND: Record<string, string> = { DIRECT: "Meldinger", AI: "Caddie", LIVE: "Live-økt" };

function snitt(runder: PHSpillerProfilData["runder"], felt: "sgOtt" | "sgApp" | "sgArg" | "sgPutt"): number | null {
  const med = runder.filter((r) => r[felt] !== null);
  return med.length ? med.reduce((s, r) => s + (r[felt] ?? 0), 0) / med.length : null;
}

export function PHSpillerProfil({ data, tilbake }: { data: PHSpillerProfilData; tilbake: { href: string; tekst: string } }) {
  const omrader = [
    { navn: "Utslag", v: snitt(data.runder, "sgOtt") },
    { navn: "Innspill", v: snitt(data.runder, "sgApp") },
    { navn: "Nærspill", v: snitt(data.runder, "sgArg") },
    { navn: "Putting", v: snitt(data.runder, "sgPutt") },
  ];
  const harSg = omrader.some((o) => o.v !== null);
  const profil: [string, string][] = [
    ["HCP", data.hcp !== null ? formaterTall(data.hcp, 1, true) : "—"],
    ["Klubb", data.homeClub ?? "—"],
    ["År med golf", data.playingYears !== null ? `${data.playingYears} år` : "—"],
    ["Ambisjon", data.ambition ?? "—"],
    ["Medlem siden", dato(data.memberSince)],
  ];

  return <div className="phn phn-sg phn-skra">
    <SkraTopp
      lav
      etikett="Spiller"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={<>Spiller{data.homeClub ? ` · ${data.homeClub}` : ""}</>}
      tittel={<>{data.navn}</>}
      ingress={<>{data.hcp !== null ? `HCP ${formaterTall(data.hcp, 1, true)}` : "HCP —"}{data.aktivPlan ? ` · ${data.aktivPlan.name}` : ""}</>}
      handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Link className="phn-sg-tilbake" href={tilbake.href}><ChevronLeft size={18} aria-hidden />{tilbake.tekst}</Link></span><Link className="phn-knapp pri skra-topp-knapp" href={`/portal/coach?spillerId=${data.id}`}>Send melding</Link><Link className="phn-knapp sek skra-topp-knapp" href={`/portal/booking?spillerId=${data.id}`}>Book økt</Link></span>}
    />
    <SkraFlyt lav><div className="phn-sg-side">

    <div className="phn-sg-tall">
      <div className="phn-kort"><span className="phn-dato">Runder</span><strong className="phn-sg-verdi">{data.stats.antallRunder || "—"}</strong></div>
      <div className="phn-kort"><span className="phn-dato">Snittscore · brutto</span><strong className="phn-sg-verdi">{data.stats.snittScore !== null ? formaterTall(data.stats.snittScore, 1, true) : "—"}</strong></div>
      <div className="phn-kort"><span className="phn-dato">Strokes Gained totalt</span><strong className="phn-sg-verdi">{sg(data.stats.sgSnitt)}</strong></div>
      <div className="phn-kort"><span className="phn-dato">Coaching</span><strong className="phn-sg-verdi">{data.stats.antallOkter || "—"}</strong></div>
    </div>

    <section className="phn-seksjon" aria-labelledby="sp-sg">
      <div className="phn-sek-topp"><h2 id="sp-sg">Strokes Gained per område</h2><span className="phn-kilde">Snitt av de siste {data.runder.length} rundene</span></div>
      {harSg
        ? <ul className="phn-sg-metrikk">{omrader.map((o) => <li key={o.navn}><span><b>{o.navn}</b></span><span className="v">{sg(o.v)}</span></li>)}</ul>
        : <div className="phn-kort" style={{ background: "var(--phn-sand-100)" }}><p className="phn-forklar">Ingen runder med Strokes Gained ennå.</p></div>}
    </section>

    <section className="phn-seksjon" aria-labelledby="sp-runder">
      <div className="phn-sek-topp"><h2 id="sp-runder">Siste runder</h2></div>
      {data.runder.length === 0
        ? <div className="phn-kort" style={{ background: "var(--phn-sand-100)" }}><p className="phn-forklar">Ingen runder registrert.</p></div>
        : <div className="phn-sg-koller phn-sp-runder">{data.runder.map((r) => <Link key={r.id} href={`/portal/statistikk/runder/${r.id}/del`}>
            <span><b>{r.kursNavn}</b><span className="phn-kilde">{dato(r.playedAt)} · SG {sg(r.sgTotal)}</span></span>
            <span className="phn-sp-score">{r.score}<small>{relativ(r.relativ)}</small></span>
            <ChevronRight size={16} aria-hidden />
          </Link>)}</div>}
    </section>

    <div className="phn-sg-fit">
      <section className="phn-kort" aria-labelledby="sp-mal">
        <h2 id="sp-mal" className="phn-sg-h">Aktive målsetninger</h2>
        {data.mal.length === 0 ? <p className="phn-forklar">Ingen aktive målsetninger.</p> : <ul className="phn-sg-metrikk">{data.mal.map((m) => <li key={m.id}>
          <span><b>{m.title}</b>{m.deadline && <span className="phn-kilde">Frist {dato(m.deadline)}</span>}</span>
          <span className="v">{m.pct !== null ? `${Math.round(m.pct)} %` : "—"}</span>
        </li>)}</ul>}
      </section>
      <section className="phn-kort" aria-labelledby="sp-plan">
        <h2 id="sp-plan" className="phn-sg-h">Aktiv plan</h2>
        {data.aktivPlan
          ? <><p className="phn-forklar">{data.aktivPlan.name}. Planen vises fullt ut i Plan.</p><Link className="phn-knapp sek" href="/portal/tren">Se plan</Link></>
          : <p className="phn-forklar">Ingen aktiv plan.</p>}
      </section>
      <section className="phn-kort" aria-labelledby="sp-coaching">
        <h2 id="sp-coaching" className="phn-sg-h">Coaching</h2>
        {data.coachingHistorikk.length === 0 ? <p className="phn-forklar">Ingen coaching registrert.</p> : <ul className="phn-sg-metrikk">{data.coachingHistorikk.map((c) => <li key={c.id}>
          <span><b>{c.coachNavn}</b><span className="phn-kilde">{KIND[c.type] ?? c.type}</span></span><span className="v">{dato(c.scheduledAt)}</span>
        </li>)}</ul>}
      </section>
      <section className="phn-kort" aria-labelledby="sp-profil">
        <h2 id="sp-profil" className="phn-sg-h">Profil</h2>
        <ul className="phn-sg-metrikk">{profil.map(([k, v]) => <li key={k}><span><b>{k}</b></span><span className="v" style={{ fontFamily: "var(--phn-sans)" }}>{v}</span></li>)}</ul>
      </section>
    </div>
  </div></SkraFlyt></div>;
}
