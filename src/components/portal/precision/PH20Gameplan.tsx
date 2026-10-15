"use client";

/**
 * PH-20 Gameplan i nytt design (pakke 9 IUP og gameplan). Markør: PH20Gameplan
 * Fasit: docs/design-system/utkast-playerhq/iup.html, skjermene «gameplan» og «hull». Stil: src/styles/playerhq-ny-iup.css.
 *
 * Banevalg, alle hull med par og lengde, hull for hull med kart og slagvalg fra tee (velg kølle) beholdes.
 *
 * Avvik:
 *   - Banekartet, hindrene, kølle-lengdene og spredningen er eksempeldata (ph20-data.ts), ikke dine TrackMan-tall.
 *     Det står på skjermen. Tegningens «lengdene er dine egne fra TrackMan» er derfor ikke med.
 *   - Snitt per hull vises som «—»: det finnes ikke registrert snitt per hull ennå (tallene i spørringen er faste eksempeltall).
 *   - Slagvalget viser utslaget (køllevalg med carry, igjen til green og risiko), ikke innspill og putter som tegningen:
 *     de slagene finnes ikke i dataene.
 *   - «Angrip» og «Spill trygt» per hull er regnet fra eksempelgeometrien: Angrip når driveren er anbefalt, ellers Spill trygt. Par 3 får ikke merke.
 *   - Knappene «Last ned gameplan» og «Lag gameplan» er fjernet: de viste bare en melding og lagret eller lastet ikke ned noe.
 *   - Banevalget viser banene fra spørringen, ikke «Neste turnering».
 *   - Skallet markerer fanen Stats for /portal/gameplan (skallets egen regel, ikke endret her); tilbakelenken går til Plan som i tegningen.
 *   - Sidene /portal/gameplan/[baneId] og /hull/[nr] (Mapbox-kart) er ikke en del av denne pakken.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-20.
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import { formaterTall } from "@/lib/format-tall";
import {
  TEE_CLUBS,
  getHoleGeo,
  getClubOptions,
  evaluateClubOptions,
  type GameplanCourseItem,
} from "@/lib/portal-gameplan/ph20-data";
import { PHIupFeil } from "@/components/portal/precision/PHIupTilstand";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-iup.css";

export type PH20Props = {
  tilstand?: "data" | "tom" | "feil";
  courses: GameplanCourseItem[];
  defaultCourseId?: string;
  /** Hull som åpnes først (0-basert). Uten verdi vises alle hull. */
  startHull?: number | null;
};

/** Kartfargene er definert i playerhq-ny-iup.css (.hull-kart). */
const KART = { skog: "var(--kart-skog)", rough: "var(--kart-rough)", fairway: "var(--kart-fairway)", green: "var(--kart-green)", sand: "var(--kart-sand)", vann: "var(--kart-vann)", tee: "var(--kart-tee)" };

function hullVurdering(i: number, par: number, len: number) {
  const geo = getHoleGeo(i, len);
  return { geo, ...evaluateClubOptions(par, len, getClubOptions(par, len), geo) };
}

function HullKart({ i, par, len, club }: { i: number; par: number; len: number; club: string }) {
  const g = getHoleGeo(i, len);
  const k = 440 / len;
  const X = (off: number) => 150 + off * k * 1.6;
  const Y = (m: number) => 490 - m * k;
  const spec = TEE_CLUBS[club] ?? { carry: len, hw: 4, ry: 4 };
  const land = Math.min(spec.carry, len);
  const rest = len - land;
  return (
    <svg className="hull-kart" viewBox="0 0 300 520" role="img"
      aria-label={`Hull ${i + 1}, par ${par}, ${len} meter. Eksempelkart. Utslag med ${club}, carry ${spec.carry} meter${rest > 0 ? `, ${rest} meter igjen` : ""}.`}>
      <rect x="0" y="0" width="300" height="520" fill={KART.skog} />
      <line x1={X(0)} y1={Y(-10)} x2={X(0)} y2={Y(len + 10)} stroke={KART.rough} strokeWidth="120" strokeLinecap="round" />
      <line x1={X(0)} y1={Y(par === 3 ? len - 30 : 140)} x2={X(0)} y2={Y(len - 10)} stroke={KART.fairway} strokeWidth="58" strokeLinecap="round" />
      {g.water && <rect x={X(g.water.off) - 12} y={Y(g.water.to)} width="24" height={(g.water.to - g.water.from) * k} rx="12" fill={KART.vann} />}
      {g.bunkers.map((b, j) => <ellipse key={j} cx={X(b.off)} cy={Y(b.d)} rx={Math.max(8, b.r * k * 1.6)} ry={Math.max(6, b.r * k)} fill={KART.sand} />)}
      <ellipse cx={X(0)} cy={Y(len)} rx="34" ry="24" fill={KART.green} />
      <circle cx={X(0)} cy={Y(len)} r="3" fill="var(--phn-g900)" />
      <rect x={X(0) - 12} y={Y(0) - 8} width="24" height="16" rx="3" fill={KART.tee} />
      <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(land)} stroke="var(--phn-hvit)" strokeWidth="2.5" strokeDasharray="6 5" />
      {rest > 0 && <line x1={X(0)} y1={Y(land)} x2={X(0)} y2={Y(len)} stroke="var(--phn-hvit)" strokeWidth="2.5" strokeDasharray="6 5" />}
      <circle cx={X(0)} cy={Y(land)} r="9" fill="var(--phn-slag)" stroke="var(--phn-hvit)" strokeWidth="2.5" />
      <rect x="164" y={Y(land) - 11} width="128" height="22" rx="4" fill="var(--phn-hvit)" />
      <text x="170" y={Y(land) + 4}>{spec.carry} m{rest > 0 ? ` · ${rest} m inn` : " · på green"}</text>
      {g.water && <><rect x="8" y={Y(g.water.to) - 11} width="98" height="22" rx="4" fill="var(--phn-hvit)" /><text x="14" y={Y(g.water.to) + 4}>Vann {Math.round(g.water.from)}–{Math.round(g.water.to)} m</text></>}
      <rect x="8" y="8" width="112" height="22" rx="4" fill="var(--phn-hvit)" /><text x="14" y="23">Eksempelkart</text>
    </svg>
  );
}

export function PH20Gameplan({ tilstand = "data", courses, defaultCourseId, startHull = null }: PH20Props) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourseId || (courses.length > 0 ? courses[0].id : ""));
  const [hull, setHull] = useState<number | null>(startHull);
  const [picks, setPicks] = useState<Record<number, string>>({});

  if (tilstand === "feil") {
    return <PHIupFeil tittel="Banen kunne ikke hentes" tekst="Banedata hentes fra GolfBox. Gameplanene dine er ikke endret." kode="Feil 502 · GolfBox" />;
  }

  const bane = courses.find((c) => c.id === selectedCourseId) ?? courses[0];
  const tom = tilstand === "tom" || !bane;
  const harHull = Boolean(bane && bane.holes.length > 0);
  const gaaTil = (i: number | null) => { setHull(i); window.scrollTo({ top: 0 }); };

  const topp = (tilbake: React.ReactNode, dato: string, tittel: string) => <div className="topp">
    {tilbake}
    <div><div className="phn-dato">{dato}</div><h1 className="phn-tittel">{tittel}</h1></div>
  </div>;
  const banner = <div className="eksempel-banner"><Info size={18} aria-hidden /><span>Banekartet er eksempeldata. Lengder, hindre og kølle-lengder er ikke målt ennå.</span></div>;

  if (!tom && harHull && hull != null && bane.holes[hull]) {
    const h = bane.holes[hull];
    const { scored, recommended } = hullVurdering(hull, h.par, h.len);
    const valgt = picks[hull] || recommended;
    const spec = TEE_CLUBS[valgt] ?? { carry: h.len, hw: 6, ry: 6 };
    const trygt = h.par !== 3 && recommended !== "Driver";
    return <div className="phn phn-iup" data-od-id="playerhq-gameplan-hull">
      {topp(<button type="button" className="tilbake" style={{ border: 0, background: "none", cursor: "pointer" }} onClick={() => gaaTil(null)}><ChevronLeft size={20} aria-hidden />Gameplan</button>,
        `${bane.name} · ${bane.tee}`, `Hull ${hull + 1} · par ${h.par} · ${h.len} m`)}
      {banner}
      <div className="to-del">
        <div>
          <HullKart i={hull} par={h.par} len={h.len} club={valgt} />
          <p className="phn-kilde" style={{ textAlign: "center" }}>Eksempeldata. Kartet er ikke målt på banen.</p>
        </div>
        <div>
          <section className="phn-kort" aria-label="Ditt snitt på hullet">
            <div className="phn-hoved"><strong>—</strong></div>
            <p className="phn-forklar">Ditt snitt på hull {hull + 1}. Det finnes ikke registrert snitt per hull ennå.</p>
          </section>
          <section className="phn-seksjon" aria-label="Slagvalg">
            <div className="phn-sek-topp"><h2>Slagvalg fra tee</h2>{h.par !== 3 && <span className={`phn-pille ${trygt ? "vent" : "ok"}`}>{trygt ? "Spill trygt" : "Angrip"}</span>}</div>
            <div className="slagplan" role="radiogroup" aria-label="Kølle fra tee">
              {scored.map((o, n) => {
                const on = o.club === valgt;
                return <button key={o.club} type="button" role="radio" aria-checked={on} className="slag-steg"
                  onClick={() => setPicks((x) => ({ ...x, [hull]: o.club }))}>
                  <span className="nr">{n + 1}</span>
                  <span><b>{o.club}{o.club === recommended ? " · anbefalt" : ""}</b>
                    <span className="i">{o.remainingMeters ? `${o.remainingMeters} m igjen` : "På green"} · {o.riskPercent ? `hinder i spredningen, ca. ${o.riskPercent} %` : "ingen hinder i spredningen"}</span></span>
                  <span className="m">{o.carry}</span>
                </button>;
              })}
            </div>
            <div className="alt-plan"><b>Spredning med {valgt}</b><span>± {spec.hw} m til siden og ± {spec.ry} m i lengde. Estimat.</span></div>
            <p className="phn-kilde">Lengdene og spredningen er eksempeltall, ikke dine egne fra TrackMan ennå.</p>
          </section>
          <div className="phn-knapper">
            <button type="button" className="phn-knapp pri" onClick={() => gaaTil(null)}>Alle hull</button>
            {hull + 1 < bane.holes.length && <button type="button" className="phn-knapp sek" onClick={() => gaaTil(hull + 1)}>Hull {hull + 2}</button>}
          </div>
        </div>
      </div>
    </div>;
  }

  return <div className="phn phn-iup" data-od-id="playerhq-gameplan">
    {topp(<Link href="/portal/planlegge" className="tilbake"><ChevronLeft size={20} aria-hidden />Plan</Link>, "Plan · gameplan", "Gameplan")}
    {tom ? <section className="phn-kort" aria-label="Ingen bane">
      <h2 style={{ margin: 0, font: "600 18px/1.25 var(--phn-sans)" }}>Ingen bane valgt</h2>
      <p className="phn-forklar">Når en bane er lagt inn, får du en plan for hvert hull her.</p>
    </section> : <>
      {banner}
      <div className="bane-topp">
        {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
        <img src="/images/playerhq/spill-bane.jpg" alt="" width={1400} height={933} />
        <div className="bt">
          <b>{bane.name} · {bane.tee.toLowerCase()}</b>
          <div className="phn-hoved"><strong>{bane.avg == null ? "—" : formaterTall(bane.avg, 1, true)}</strong>
            <span className="phn-forklar">{bane.avg == null ? "ingen registrerte runder her ennå" : `din snittscore her, ${bane.played} ${bane.played === 1 ? "runde" : "runder"}`}</span></div>
          <p className="phn-kilde">Kilde: dine registrerte runder på banen. Par {bane.par} · {formaterTall(bane.len, 0, false)} m.</p>
          {courses.length > 1 && <div className="bane-valg" role="group" aria-label="Bane">{courses.map((c) =>
            <button key={c.id} type="button" aria-pressed={c.id === bane.id} onClick={() => { setSelectedCourseId(c.id); setHull(null); }}>{c.name}</button>)}</div>}
        </div>
      </div>
      <section className="phn-seksjon" aria-label="Hull for hull">
        <div className="phn-sek-topp"><h2>Hull for hull</h2>
          <span className="phn-lg-rad"><span className="phn-lg"><i style={{ background: "var(--phn-green-50)", border: "1px solid var(--phn-green-700)" }} />Angrip</span>
            <span className="phn-lg"><i style={{ background: "var(--phn-amber-50)", border: "1px solid var(--phn-amber-700)" }} />Spill trygt</span></span></div>
        {harHull ? <div className="hull-grid">{bane.holes.map((h, i) => {
          const { recommended } = hullVurdering(i, h.par, h.len);
          const merke = h.par === 3 ? null : recommended === "Driver" ? "angrip" : "forsiktig";
          return <button key={i} type="button" className="hull" aria-label={`Hull ${i + 1}, par ${h.par}, ${h.len} meter${merke ? `, ${merke === "angrip" ? "angrip" : "spill trygt"}` : ""}`} onClick={() => gaaTil(i)}>
            <b>{i + 1}</b><span>Par {h.par} · {h.len} m</span>
            {merke && <span className={`ris ${merke}`}>{merke === "angrip" ? "Angrip" : "Spill trygt"}</span>}
          </button>;
        })}</div> : <p className="phn-forklar">Hullene på {bane.name} er ikke lagt inn ennå.</p>}
      </section>
    </>}
  </div>;
}
