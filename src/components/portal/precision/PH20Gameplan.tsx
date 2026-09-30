"use client";

/**
 * PH-20 Gameplan og banekart — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-20.jsx, etag 1790567099789847).
 *
 * Banebibliotek (PH20Baner) og hull for hull-visning (PH20Bane) med skjematisk
 * hullkart, slagvalg fra tee og hullvelger.
 *
 * Bevisste avvik fra tegningen:
 *   - Tallene er spillerens egne registrerte tee-slag (Shot.club, GPS), ikke en fast
 *     TrackMan-tabell. «Lengde» er avstand tee til der ballen ble liggende (total, med rull), ikke carry. Køller med under 3 slag vises uten spredning og anbefales ikke.
 *   - Bunker og vann tegnes ikke: banedata har ingen hindre per hull (tegningens
 *     hindre var eksempeldata). Anbefalingen bygger derfor ikke på hindre.
 *   - «Snitt på hullet» utgår: scorer per hull er ikke koblet til banen.
 *   - «Last ned gameplan» (PDF) og «Lag gameplan» finnes ikke i koden og er ikke med.
 *     Planlegging av sikte og soner skjer som før i /portal/gameplan/[baneId]/hull/[nr].
 *   - Hullkartet er skjematisk (rett fairway) med hullets ekte par og lengde.
 */
import { useState } from "react";
import Link from "next/link";
import { Map as KartIkon, MapPin, CircleAlert, Crosshair } from "lucide-react";
import { Meta, StatusPille, TomTilstand, FeilTilstand, KnappLenke } from "@/components/precision/pa";
import { SideHode, Side, Stabel, Nokkelverdi } from "@/components/precision/pa-a4";
import { MIN_SLAG, anbefalt, klubbValg, type KlubbValg } from "@/lib/gameplan/slagvalg";
import type { LatLng } from "@/lib/gameplan/shot-coords";
import "@/styles/precision-ph20.css";

export type PH20BaneKort = { id: string; navn: string; klubb: string; hull: number; par: number | null; meter: number | null; runder: number; kartlagt: boolean };

export function PH20Baner({ baner, feil, feilKode }: { baner: PH20BaneKort[]; feil?: boolean; feilKode?: string }) {
  return <Side max={1400}>
    <Stabel>
      <SideHode kicker="Analyse · Gameplan" title="Gameplan og banekart" sub="Velg bane og hull. Slagvalget bygger på dine egne tee-slag." />
      {feil ? <FeilTilstand icon={CircleAlert} title="Banekartet kunne ikke lastes" text="Gameplanene dine er lagret. Prøv igjen om litt." code={feilKode ?? "FEIL 500 · GAMEPLAN"} />
        : baner.length === 0 ? <TomTilstand icon={KartIkon} title="Ingen gameplan ennå" text="Spill en runde, så dukker banen din opp her med slagvalg per hull."
          actions={<KnappLenke href="/portal/runde/live" icon={Crosshair} iconName="crosshair">Start live-føring</KnappLenke>} />
          : <>
            <div className="ph20-baner">
              {baner.map((b) => <Link key={b.id} href={`/portal/gameplan/${b.id}`} className="pa-card pa-card--interactive ph20-bane">
                <span className="ph20-bane__navn">{b.navn}</span>
                <Meta>{[b.klubb, b.kartlagt ? `${b.hull} HULL` : null, b.par ? `PAR ${b.par}` : null, b.meter ? `${b.meter.toLocaleString("nb-NO").replace(/\s/g, " ")} M` : null].filter(Boolean).join(" · ").toUpperCase()}</Meta>
                <span className="ph20-bane__rad">
                  <Meta>{b.runder} {b.runder === 1 ? "RUNDE" : "RUNDER"}</Meta>
                  <span style={{ flex: 1 }} />
                  <StatusPille tone={b.kartlagt ? "ok" : "neutral"}>{b.kartlagt ? "Kartlagt" : "Ikke kartlagt"}</StatusPille>
                </span>
              </Link>)}
            </div>
            <Meta>BANEDATA · KARTLAGTE HULL. KILDE OG DATO PER BANE VISES PÅ BANESIDEN. BUNKER OG VANN VISES IKKE ENNÅ.</Meta>
          </>}
    </Stabel>
  </Side>;
}

export type PH20Hull = { nr: number; par: number | null; meter: number | null; tee: LatLng | null; green: LatLng | null; teeSlag: { klubb: string | null; landing: LatLng }[] };

type Rad = { id: string; n: number; par: string; tee: string };

function Hullrader({ rader, valgt, onVelg }: { rader: Rad[]; valgt: number; onVelg: (i: number) => void }) {
  return <div className="pa-card ph20-rader" role="group" aria-label="Hull-liste">
    <div className="ph20-rad ph20-rad--hode"><Meta>HULL</Meta><Meta>PAR</Meta><Meta>TEE</Meta></div>
    {rader.map((r, i) => <button key={r.id} type="button" className="ph20-rad" aria-pressed={i === valgt} onClick={() => onVelg(i)}>
      <span style={{ font: "600 14px/1 var(--font-mono)" }}>{r.n}</span><span style={{ font: "var(--type-num-s)" }}>{r.par}</span>
      <span style={{ font: "var(--type-num-s)", overflowWrap: "anywhere" }}>{r.tee}</span>
    </button>)}
  </div>;
}

const dec = (n: number) => String(Math.round(n));

function Hullkart({ hull, valg }: { hull: PH20Hull; valg: KlubbValg | null }) {
  const len = hull.meter ?? 0, k = 640 / Math.max(len, 1), X = (o: number) => 200 + o * k, Y = (m: number) => 690 - m * k;
  const par = hull.par, fwFra = par === 3 ? len - 30 : 150;
  const fw = `M${X(-15)} ${Y(fwFra)} L${X(-15)} ${Y(len - 22)} Q${X(0)} ${Y(len - 12)} ${X(15)} ${Y(len - 22)} L${X(15)} ${Y(fwFra)} Q${X(0)} ${Y(fwFra - 10)} ${X(-15)} ${Y(fwFra)}Z`;
  const land = valg ? Math.min(valg.carry, len) : 0;
  const lat = valg ? Math.max(-40, Math.min(40, valg.sideSnitt)) : 0;
  const beskrivelse = `Hull ${hull.nr}, par ${par ?? "ukjent"}, ${len} meter${valg ? `, slagvalg ${valg.klubb} lengde ${dec(valg.carry)} meter` : ""}`;
  return <svg viewBox="0 0 400 720" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} role="img" aria-label={beskrivelse}>
    <rect x="0" y="0" width="400" height="720" fill="var(--sand-200)" />
    {len > 0 && <>
      <path d={fw} fill="var(--sand-100)" stroke="var(--border-strong)" strokeWidth="1" />
      <circle cx={X(0)} cy={Y(len)} r={14 * k} fill="var(--surface-card)" stroke="var(--text-primary)" strokeWidth="1.5" />
      <line x1={X(0)} y1={Y(len)} x2={X(0)} y2={Y(len) - 26} stroke="var(--text-primary)" strokeWidth="1.5" />
      <path d={`M${X(0)} ${Y(len) - 26} l14 5 l-14 5Z`} fill="var(--text-primary)" />
      {[100, 150, 200].filter((m) => m < len - 20).map((m) => <g key={m}>
        <line x1="24" x2="376" y1={Y(len - m)} y2={Y(len - m)} stroke="var(--text-muted)" strokeDasharray="2 5" />
        <text x="28" y={Y(len - m) - 4} style={{ font: "500 12px var(--font-mono)", fill: "var(--text-secondary)" }}>{m} M</text>
      </g>)}
      {valg && <>
        {valg.sideSpredning != null && valg.lengdeSpredning != null
          ? <ellipse cx={X(lat)} cy={Y(land)} rx={valg.sideSpredning * k} ry={valg.lengdeSpredning * k} fill="var(--text-primary)" fillOpacity=".1" stroke="var(--text-primary)" strokeDasharray="5 4" strokeWidth="1.5" />
          : null}
        <polyline points={`${X(0)},${Y(4)} ${X(lat)},${Y(land)}`} fill="none" stroke="var(--text-primary)" strokeWidth="2" />
        <circle cx={X(lat)} cy={Y(land)} r="5" fill="var(--text-primary)" />
        <text x={X(lat) + Math.max(12, (valg.sideSpredning ?? 0) * k + 8)} y={Y(land) + 4} style={{ font: "600 13px var(--font-mono)", fill: "var(--text-primary)" }}>{valg.klubb} · {dec(valg.carry)} M</text>
        {land < len && <text x={X(0) + 8} y={(Y(land) + Y(len)) / 2} style={{ font: "500 12px var(--font-mono)", fill: "var(--text-secondary)" }}>{dec(len - land)} M IGJEN</text>}
      </>}
    </>}
    <rect x={X(-6)} y={Y(0) - 8} width={12 * k || 12} height="10" rx="2" fill="var(--graphite-600)" />
    <rect x="12" y="12" width="236" height="26" rx="4" fill="var(--surface-card)" stroke="var(--border-strong)" />
    <text x="22" y="30" style={{ font: "600 12px var(--font-sans)", fill: "var(--text-primary)" }}>Skjematisk hull, ikke målt form</text>
    <text x="376" y="708" textAnchor="end" style={{ font: "500 12px var(--font-mono)", fill: "var(--text-secondary)" }}>HULL {hull.nr} · PAR {par ?? "—"} · {len || "—"} M</text>
  </svg>;
}

export function PH20Bane({ bane, hull, planleggHref, baneHref = "/portal/gameplan", sisteSlag = null }: {
  bane: { id: string; navn: string; klubb: string }; hull: PH20Hull[]; planleggHref: (nr: number) => string; baneHref?: string;
  /** ISO-tidspunkt for siste registrerte tee-slag på banen, null om ingen. */
  sisteSlag?: string | null;
}) {
  const [h, setH] = useState(0);
  const [valgt, setValgt] = useState<Record<number, string>>({});
  const har = hull.length > 0;
  const aktiv = hull[h];
  const alle = aktiv?.tee && aktiv.green && aktiv.meter ? klubbValg(aktiv.teeSlag, aktiv.tee, aktiv.green, aktiv.meter) : [];
  const rek = aktiv ? anbefalt(alle, aktiv.par, aktiv.meter ?? 0) : null;
  const klubb = aktiv ? (valgt[aktiv.nr] && alle.some((v) => v.klubb === valgt[aktiv.nr]) ? valgt[aktiv.nr] : rek ?? alle[0]?.klubb ?? null) : null;
  const aktivValg = alle.find((v) => v.klubb === klubb) ?? null;
  const velger = <div className="ph20-hull" role="group" aria-label="Hull">
    {hull.map((x, i) => <button key={x.nr} type="button" className="ph20-hull__knapp" aria-pressed={i === h} aria-label={`Hull ${x.nr}`} onClick={() => setH(i)}>
      <span className="ph20-hull__nr">{x.nr}</span><span className="ph20-hull__par">PAR {x.par ?? "—"}</span>
    </button>)}
  </div>;
  const rader: Rad[] = hull.map((x, i) => ({ id: String(i), n: x.nr, par: x.par != null ? String(x.par) : "—", tee: (() => { const v = x.tee && x.green && x.meter ? klubbValg(x.teeSlag, x.tee, x.green, x.meter) : []; return valgt[x.nr] ?? anbefalt(v, x.par, x.meter ?? 0) ?? "—"; })() }));

  return <Side max={1400}>
    <Stabel>
      <SideHode kicker={`Analyse · Gameplan · ${bane.klubb}`} title={bane.navn} sub="Velg hull. Slagvalget bygger på dine egne tee-slag på hullet."
        actions={<KnappLenke variant="secondary" href={baneHref}>Alle baner</KnappLenke>} />
      {!har || !aktiv ? <TomTilstand icon={MapPin} title={`Ingen gameplan for ${bane.navn}`} text="Banen er ikke kartlagt ennå. Geometri legges inn av AK Golf HQ når banen er lagt til i systemet." />
        : <div className="ph20-kolonner">
          <div className="ph20-liste"><Hullrader rader={rader} valgt={h} onVelg={setH} /></div>
          <Stabel>
            <div className="ph20-hullvelger">{velger}</div>
            <div className="pa-card ph20-kart"><Hullkart hull={aktiv} valg={aktivValg} /></div>
            <Meta>BANEDATA · KARTLAGTE HULL · SISTE SLAG {sisteSlag ? new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(sisteSlag)) : "—"} · HINDER VISES IKKE ENNÅ</Meta>
          </Stabel>
          <Stabel>
            <div className="pa-card" style={{ padding: 16, gap: 12, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span className="kicker">Slagvalg fra tee · hull {aktiv.nr}</span>
              {alle.length === 0
                ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen tee-slag registrert på dette hullet ennå. Slagvalg vises når du har ført slag med kølle her.</p>
                : <div role="radiogroup" aria-label="Kølle fra tee" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {alle.map((o) => <button key={o.klubb} type="button" role="radio" aria-checked={o.klubb === klubb} className="ph20-valg" onClick={() => setValgt((x) => ({ ...x, [aktiv.nr]: o.klubb }))}>
                    <span style={{ font: "600 15px/1 var(--font-mono)", overflowWrap: "anywhere" }}>{o.klubb}</span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                      <span style={{ font: "var(--type-num-s)" }}>Lengde {dec(o.carry)} m · {o.igjen > 0 ? `${dec(o.igjen)} m igjen` : "på green"}</span>
                      <Meta style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                        {o.n < MIN_SLAG ? <>{o.n} SLAG · FOR FÅ TIL SPREDNING</> : <>{o.n} SLAG · ESTIMAT</>}
                      </Meta>
                    </span>
                    {o.klubb === rek ? <StatusPille tone="neutral">Anbefalt</StatusPille> : <span />}
                  </button>)}
                </div>}
              <Nokkelverdi items={[
                ["Spredning", aktivValg?.sideSpredning != null && aktivValg.lengdeSpredning != null ? `± ${dec(aktivValg.sideSpredning)} m side · ± ${dec(aktivValg.lengdeSpredning)} m lengde` : "—", { hint: "2 SD · ESTIMAT" }],
                ["Slag i grunnlaget", aktivValg ? String(aktivValg.n) : "—", { mono: true }],
              ]} />
              <KnappLenke variant="secondary" fullWidth icon={Crosshair} iconName="crosshair" href={planleggHref(aktiv.nr)}>Planlegg hullet</KnappLenke>
            </div>
            <div className="ph20-hovedliste"><Hullrader rader={rader} valgt={h} onVelg={setH} /></div>
          </Stabel>
        </div>}
    </Stabel>
  </Side>;
}
