"use client";

/**
 * Skill map i nytt design (PlayerHQ pakke 13, Stats resten, godkjent av Anders 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «skillmap». Stil: playerhq-ny-statsresten-omrade.css.
 * Hullet er delt i soner (utslag, fire innspillsavstander, fire nærspill og seks puttelengder). Trykk på en sone
 * viser SG, utviklingen og øvelser. Kategori B og PGA Tour er en bryter på skjermen.
 *
 * Avvik:
 *   - Kategori B-referansen per A–K-kategori er ikke satt. Med Kategori B valgt står sonene grå med «—», og
 *     detaljen sier at referansen mangler. Bryteren starter derfor på PGA Tour så lenge Kategori B mangler.
 *   - Utkastet har 16 soner; Stats lagrer 15 (putt 10–15 og 15–25 fot er slått sammen til 10–25 fot, som i Stats).
 *   - Nærhet til hullet lagres ikke per sone ennå. Boksene vises bare når tallet finnes.
 *   - «Caddie foreslår …» er byttet med en fast tekst: forslaget per sone finnes ikke.
 *   - Utviklingen er siste 10 runder mot de 10 før (som Stats), ikke «siste 10 runder».
 *   - «Øvelser for …» åpner Øvelsesbanken uten forhåndsvalgt filter.
 *   - «Green · ringene er puttlengde» står i teksten under kartet, ikke i kartet (den lå oppå innspillssonen).
 */
import Link from "next/link";
import { useState } from "react";
import { Crosshair } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { formaterDesimal, formaterSg, MIN_RUNDER_FOR_KONKLUSJON, type PH16StatsData, type SgRad } from "@/lib/portal-analyse/ph16-stats-data";
import { SG_GRUPPE_INFO, SIKKER_RUNDER, type SgGruppe } from "@/lib/portal-analyse/omrade-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import "@/styles/playerhq-ny-statsresten-omrade.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke7-skra.css";

export interface PH16bSkillMapProps {
  data: PH16StatsData;
  /** Runder med SG i hver gruppe, for «Foreløpig», og perioden de dekker. */
  grunnlag: Record<SgGruppe, { antall: number; periode: string | null }>;
  /** ?pga=1 i adressen: start på PGA Tour. */
  pgaTour?: boolean;
}

type Mot = "b" | "pga";
type Form = { rect: [number, number, number, number] } | { sirkel: [number, number, number] } | { ring: number };

// Geometri i viewBox 320 × 470 som i utkastet, med lob, bunker og innerste putteringer litt større (treffmål 44 px). Tee nederst, greenen øverst.
const FORM: Record<string, Form> = {
  tee: { rect: [110, 400, 100, 44] },
  i200: { rect: [80, 330, 160, 56] },
  i150: { rect: [80, 270, 160, 56] },
  i100: { rect: [80, 210, 160, 56] },
  i50: { rect: [80, 150, 160, 56] },
  chip: { sirkel: [40, 70, 22] },
  pitch: { sirkel: [280, 70, 22] },
  lob: { sirkel: [52, 126, 22] },
  bunker: { sirkel: [268, 126, 22] },
  p40: { ring: 66 },
  p20: { ring: 56 },
  p10: { ring: 47 },
  p6: { ring: 39 },
  p3: { ring: 31 },
  p0: { ring: 23 },
};

function farge(v: number | null): string {
  if (v == null) return "var(--phn-sand-150)";
  if (v >= 0.05) return "var(--phn-green-50)";
  if (v > -0.15) return "#dbe6fb";
  if (v > -0.35) return "#8fb0f3";
  return "var(--phn-slag)";
}

function navn(r: SgRad): string {
  if (r.g === "tee") return "Utslag";
  if (r.g === "innspill") return `Innspill ${r.label}`;
  if (r.g === "putt") return `Putt ${r.label}`;
  return r.label;
}

export function PH16bSkillMap({ data, grunnlag, pgaTour = false }: PH16bSkillMapProps) {
  const rader = data.sg.flatMap((g) => g.rows);
  const harB = rader.some((r) => r.c != null);
  const [mot, setMot] = useState<Mot>(pgaTour || !harB ? "pga" : "b");
  const [valgtId, setValgtId] = useState<string>(rader.some((r) => r.id === "i100") ? "i100" : rader[0]?.id ?? "");
  const verdi = (r: SgRad) => (mot === "pga" ? r.pga : r.c);
  const motNavn = mot === "b" ? "Kategori B" : "PGA Tour";
  const valgt = rader.find((r) => r.id === valgtId);
  const antallRunder = Math.max(0, ...Object.values(grunnlag).map((g) => g.antall));

  function sone(r: SgRad) {
    const form = FORM[r.id];
    if (!form) return null;
    const v = verdi(r), svak = v != null && v <= -0.35;
    const felles = {
      className: `z${r.id === valgtId ? " valgt" : ""}`,
      tabIndex: 0,
      role: "button",
      "aria-pressed": r.id === valgtId,
      "aria-label": `${navn(r)}, ${v == null ? "ingen tall" : `${formaterSg(v)} slag per runde`}`,
      onClick: () => setValgtId(r.id),
      onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setValgtId(r.id); } },
    };
    if ("rect" in form) {
      const [x, y, w, h] = form.rect;
      return (
        <g key={r.id}>
          <rect {...felles} x={x} y={y} width={w} height={h} rx={6} fill={farge(v)} />
          <text x={160} y={y + h / 2 - 2} textAnchor="middle" className={svak ? "hvit" : undefined}>{r.g === "tee" ? "Utslag" : r.label}</text>
          <text x={160} y={y + h / 2 + 12} textAnchor="middle" className={`m${svak ? " hvit" : ""}`}>{formaterSg(v)}</text>
        </g>
      );
    }
    if ("sirkel" in form) {
      const [cx, cy, rr] = form.sirkel, bunker = r.id === "bunker";
      return (
        <g key={r.id}>
          <circle {...felles} cx={cx} cy={cy} r={rr} fill={bunker && v == null ? "#efe2c4" : farge(v)} stroke={bunker ? "#c9b48a" : "none"} />
          <text x={cx} y={cy + 3} textAnchor="middle" className={svak ? "hvit" : undefined}>{r.label}</text>
        </g>
      );
    }
    return <circle key={r.id} {...felles} cx={160} cy={80} r={form.ring} fill={farge(v)} stroke="var(--phn-hvit)" strokeWidth={1.5} />;
  }

  const ikkeRinger = rader.filter((r) => FORM[r.id] && !("ring" in FORM[r.id]!));
  const ringer = rader.filter((r) => FORM[r.id] && "ring" in FORM[r.id]!).sort((a, b) => (FORM[b.id] as { ring: number }).ring - (FORM[a.id] as { ring: number }).ring);

  return (
    <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Stats"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={<>Strokes Gained · {antallRunder} {antallRunder === 1 ? "runde" : "runder"} slag for slag</>}
      tittel={<>Skill map</>}
      handling={<span className="skra-tilbake"><TmTilbake href="/portal/analysere?del=sg" tekst="Stats" /></span>}
    />
    <SkraFlyt lav>
      <div className="phn-om-sammenlign" role="group" aria-label="Sammenlign med">
          <button type="button" aria-pressed={mot === "b"} onClick={() => setMot("b")}>Kategori B</button>
          <button type="button" aria-pressed={mot === "pga"} onClick={() => setMot("pga")}>PGA Tour</button>
        </div>

      <div className="phn-om-kart-grid">
        <div className="phn-seksjon">
          <svg className="phn-om-hullkart" viewBox="0 0 320 470" role="group" aria-label="Hullet delt i soner. Trykk på en sone.">
            <path d="M60 460 L60 150 Q60 40 160 40 Q260 40 260 150 L260 460 Z" fill="var(--phn-om-fairway)" />
            {ikkeRinger.map(sone)}
            <circle cx={160} cy={80} r={70} fill="var(--phn-om-green)" />
            {ringer.map(sone)}
            <circle cx={160} cy={80} r={4} fill="var(--phn-g900)" />
            <text x={160} y={455} textAnchor="middle">Tee</text>
          </svg>
          <p className="phn-kilde phn-om-sentrert">Fargen er SG per runde mot {motNavn}. Mørkere blå taper mer. Ringene på greenen er puttlengde.</p>
        </div>
        {valgt ? <Detalj r={valgt} mot={mot} harB={harB} grunnlag={grunnlag[valgt.g]} /> : <section className="phn-kort phn-om-detalj"><p className="phn-forklar">Ingen soner å vise ennå.</p></section>}
      </div>
      <Link className="phn-lenke" href="/portal/analysere?del=sg" style={{ justifySelf: "start" }}>Se som liste i Stats</Link>
    </SkraFlyt>
    </div>
  );
}

function Detalj({ r, mot, harB, grunnlag }: { r: SgRad; mot: Mot; harB: boolean; grunnlag: { antall: number; periode: string | null } }) {
  const v = mot === "pga" ? r.pga : r.c;
  const motNavn = mot === "b" ? "Kategori B" : "PGA Tour";
  const gruppe = SG_GRUPPE_INFO[r.g].navn;
  const forelopig = (r.g === "naer" || r.g === "putt") && grunnlag.antall < SIKKER_RUNDER[r.g];
  return (
    <section className="phn-kort phn-om-detalj" aria-live="polite">
      <div className="phn-sek-topp"><h2>{navn(r)}</h2><span className="phn-kilde">{gruppe}</span></div>
      {v == null ? (
        <>
          <div className="phn-hoved"><strong>—</strong></div>
          <p className="phn-forklar">
            {mot === "b" && !harB && r.pga != null
              ? "Referansen for Kategori B er ikke satt ennå. Velg PGA Tour for å se tallet."
              : `For få runder med slag herfra ennå (${r.n} av de siste 10). Tallet vises fra ${MIN_RUNDER_FOR_KONKLUSJON} runder.`}
          </p>
        </>
      ) : (
        <>
          <div className="phn-hoved">
            <strong>{formaterSg(v)}</strong>
            {mot === "pga" && r.d != null && Math.abs(r.d) >= 0.05 && (
              <span className={`phn-trend ${r.d > 0 ? "opp" : "ned"}`}>{formaterSg(r.d)} mot de 10 før</span>
            )}
          </div>
          <p className="phn-forklar">
            Slag per runde mot {motNavn} <span className="phn-om-merke">Estimat</span>{forelopig && <> <span className="phn-om-merke">Foreløpig</span></>}
          </p>
          {r.prox && (
            <div className="phn-om-naer">
              <span><b>{formaterDesimal(r.prox[0], 1)} m</b>du, fra hullet</span>
              <span><b>{formaterDesimal(r.prox[1], 1)} m</b>PGA Tour</span>
            </div>
          )}
        </>
      )}
      <p className="phn-kilde">{r.n} {r.n === 1 ? "runde" : "runder"} i snittet{grunnlag.periode ? ` · ${grunnlag.periode}` : ""} · brutto</p>
      {v != null && v <= -0.15 && (
        <>
          <div className="phn-uthev slag"><Crosshair className="phn-ikon" aria-hidden /><span><b>Her ligger mest å hente.</b> Legg inn øvelser for {navn(r).toLowerCase()} i planen.</span></div>
          <Link className="phn-knapp pri" href="/portal/drills">Øvelser for {navn(r).toLowerCase()}</Link>
        </>
      )}
    </section>
  );
}
