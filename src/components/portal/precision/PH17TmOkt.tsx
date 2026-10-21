"use client";

/**
 * PH-17 Én TrackMan-økt — nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, skjerm «tmokt». Stil: playerhq-ny-stats.css.
 *
 * Avvik:
 *   - Greenen er en tegnet skisse, 25 m bred, ikke bildet fra utkastet. Bildet var et kartutsnitt;
 *     appen trenger et eget eller lisensiert bilde per green med målt bredde og retning (åpent hos Anders).
 *   - Øktene har ikke eget navn eller varighet i basen. Navnet er oppgaven i teknisk plan, ellers køllene.
 *   - Treffpunkt vises bare når TrackMan har målt det (Strike Pattern). Ellers står det «—».
 */
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  TM_HAST_NAVN, formaterTm, fraMal, oktHast, oktKoller, oktNavn, peiProsent, sd, snitt, tellende, tmFilterSok, tmParam, tmTall,
  type TmFilter, type TmOkt, type TmSlag,
} from "@/lib/portal-analyse/trackman-stats";
import { TmAlleTall, TmTilbake, tmLangDag } from "./PH17TmFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke4-skra.css";

const STI = "/portal/analysere/trackman";
const harPunkt = (s: TmSlag): s is TmSlag & { carry: number; side: number } => s.carry != null && s.side != null;

export function PH17TmOkt({ okt, filter }: { okt: TmOkt; filter: TmFilter }) {
  const koller = oktKoller(okt);
  const [valgt, setValgt] = useState(koller[0] ?? "");
  const [antall, setAntall] = useState(12);
  const akse = okt.plan ? "tek" : "slag";
  const hast = oktHast(okt.slag);

  const slag = okt.slag.filter((s) => s.kolle === valgt);
  const med = tellende(slag, filter);
  const u = snitt(med);
  const mal = slag.find((s) => s.mal != null)?.mal ?? null;
  const ekstr = slag.filter((s) => s.ekstrem).length;
  const sdSide = sd(med, "side"), sdLengde = sd(med, "carry");
  const medMal = med.filter((s) => fraMal(s) != null);
  const inne = medMal.filter((s) => (fraMal(s) as number) <= 3).length;
  const pei = peiProsent(med);
  const treff = slag.filter((s) => s.sx != null && s.sy != null);
  const midtX = treff.length ? treff.reduce((a, s) => a + (s.sx as number), 0) / treff.length : null;

  return (
    <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="TrackMan-økt"
      bilde="/images/playerhq/slag-simulator.jpg" bildePosisjon="50% 50%"
      overlinje={`TrackMan · ${tmLangDag(okt.dato)}`}
      tittel={oktNavn(okt)}
      handling={<span className="skra-topp-rad"><span className="skra-tilbake"><TmTilbake href={`${STI}${tmFilterSok(filter)}`} tekst="TrackMan" /></span></span>}
    />
    <SkraFlyt lav>
      <div className={`phn-fylt ${akse}`}>
        <span className="phn-akse-tekst">{[akse.toUpperCase(), okt.sted, hast && TM_HAST_NAVN[hast]].filter(Boolean).join(" · ").toUpperCase()}</span>
        <div className="phn-rad">
          <span className="phn-stor">{okt.slag.length}<small>slag</small></span>
          <span className="phn-trend">{koller.length} {koller.length === 1 ? "kølle" : "køller"}</span>
        </div>
        {okt.plan && <p>Koblet til teknisk plan: {okt.plan}.</p>}
      </div>
      {koller.length > 1 && (
        <div className="phn-valg" role="group" aria-label="Kølle">
          {koller.map((k) => (
            <button key={k} type="button" aria-pressed={k === valgt} onClick={() => { setValgt(k); setAntall(12); }}>
              {k} · {okt.slag.filter((s) => s.kolle === k).length}
            </button>
          ))}
        </div>
      )}
      <div className="phn-to-kol">
        <div className="phn-kol">
          <section className="phn-kort">
            <div className="phn-hoved">
              {mal != null && medMal.length ? (
                <><strong>{inne}<small>/ {medMal.length} i målet</small></strong><span className="phn-trend">PEI {pei == null ? "—" : `${tmTall(pei, 1)} %`}</span></>
              ) : (
                <><strong>{u.carry == null ? "—" : Math.round(u.carry)}<small>m carry</small></strong><span className="phn-trend">{med.length} slag</span></>
              )}
            </div>
            <Spredningskart slag={slag} med={med} mal={mal} kolle={valgt} />
            <div className="phn-lg-rad">
              <span className="phn-lg"><i style={{ background: "var(--phn-slag)", borderRadius: "50%" }} />Ett slag</span>
              <span className="phn-lg"><i style={{ background: "var(--phn-amber-700)", borderRadius: "50%" }} />Ekstremt slag</span>
              <span className="phn-lg"><i style={{ border: "2px dashed var(--phn-g900)", background: "transparent" }} />Spredning</span>
            </div>
            <p className="phn-forklar">
              Spredning: <b className="phn-mono">{sdSide == null ? "—" : `±${Math.round(2 * sdSide)} m`}</b> til siden og{" "}
              <b className="phn-mono">{sdLengde == null ? "—" : `±${Math.round(2 * sdLengde)} m`}</b> i lengde{mal != null ? ". Målet er grønt, ±3 m." : "."}
              {ekstr > 0 && ` ${ekstr} ${ekstr === 1 ? "ekstremt slag er" : "ekstreme slag er"} ${filter.ekstreme ? "med i snittet." : "vist i gult, men ikke med i snittet."}`}
            </p>
          </section>
          <Green slag={slag} med={med} mal={mal} filter={filter} />
          <section className="phn-kort">
            <div className="phn-sek-topp"><h2>Treffpunkt</h2><span className="phn-kilde">Køllebladet</span></div>
            {treff.length ? (
              <>
                <svg className="phn-graf" viewBox="0 0 320 170" role="img" aria-label={`Treffpunkt på køllebladet for ${treff.length} slag`}>
                  <rect x="50" y="20" width="220" height="120" rx="26" fill="var(--phn-sand-100)" stroke="var(--phn-g500)" />
                  <line x1="160" x2="160" y1="26" y2="134" stroke="var(--phn-sand-300)" />
                  <line x1="56" x2="264" y1="80" y2="80" stroke="var(--phn-sand-300)" />
                  {treff.map((s) => (
                    <circle key={s.nr} cx={(160 + (s.sx as number) * 100)} cy={(80 - (s.sy as number) * 52)} r="4" fill={s.ekstrem ? "var(--phn-amber-700)" : "var(--phn-slag)"} fillOpacity=".7" />
                  ))}
                  <text x="44" y="84" textAnchor="end" className="gt">Hæl</text>
                  <text x="276" y="84" className="gt">Tå</text>
                  <text x="160" y="160" textAnchor="middle" className="gt">Sett forfra</text>
                </svg>
                <p className="phn-forklar">{midtX != null && Math.abs(midtX) < 0.08 ? "Treffene ligger midt på bladet." : `Treffene ligger litt mot ${(midtX ?? 0) > 0 ? "tåa" : "hælen"}.`}</p>
              </>
            ) : <p className="phn-forklar">— TrackMan målte ikke treffpunktet i denne økta.</p>}
          </section>
        </div>
        <div className="phn-kol">
          <section className="phn-kort">
            <div className="phn-sek-topp"><h2>Alle tall</h2><span className="phn-kilde">Snitt av {med.length} slag</span></div>
            <div><TmAlleTall verdier={med.length ? u : null} /></div>
          </section>
          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Slag for slag</h2><span className="phn-kilde">{slag.length} slag med {valgt}</span></div>
            <div className="phn-slag-liste">
              {slag.slice(0, antall).map((s) => {
                const fm = fraMal(s);
                return (
                  <details key={s.nr} className={`phn-slag-rad${s.ekstrem ? " ekstrem" : ""}`}>
                    <summary>
                      <span>
                        <b>Slag {s.nr}</b>
                        {s.ekstrem && <span className="phn-pille vent" style={{ marginLeft: 8 }}>Ekstremt</span>}
                        <small>{formaterTm(tmParam("cs"), s.cs)} · {formaterTm(tmParam("ftp"), s.ftp)} Face to Path</small>
                      </span>
                      <span className="phn-sr-h">
                        <b>{s.carry == null ? "—" : `${Math.round(s.carry)} m`}</b>
                        <small>{formaterTm(tmParam("side"), s.side)}{fm != null && s.mal ? ` · PEI ${tmTall((fm / s.mal) * 100, 1)} %` : ""}</small>
                      </span>
                    </summary>
                    <TmAlleTall verdier={s} />
                  </details>
                );
              })}
            </div>
            {slag.length > antall && (
              <button type="button" className="phn-knapp sek" onClick={() => setAntall(Number.MAX_SAFE_INTEGER)}>Vis alle {slag.length} slag</button>
            )}
          </section>
        </div>
      </div>
    </SkraFlyt>
    </div>
  );
}

function Spredningskart({ slag, med, mal, kolle }: { slag: TmSlag[]; med: TmSlag[]; mal: number | null; kolle: string }) {
  const punkter = slag.filter(harPunkt);
  const tellPunkter = med.filter(harPunkt);
  if (!tellPunkter.length) {
    return <p className="phn-forklar">— Slagene mangler carry eller side, så spredningen kan ikke tegnes.</p>;
  }
  const u = snitt(tellPunkter);
  const sideS = sd(tellPunkter, "side") || 1, lenS = sd(tellPunkter, "carry") || 1;
  const midt = mal ?? (u.carry as number), cx = 160;
  const spennY = Math.max(lenS * 4, 6), spennX = Math.max(sideS * 3, 5);
  const y = (c: number) => 128 - (c - midt) * (100 / spennY);
  const x = (s: number) => cx + s * (140 / spennX);
  const ry = (3 * 100) / spennY;
  return (
    <svg className="phn-graf" viewBox="0 0 320 260" role="img" aria-label={`Spredningskart for ${kolle}, ${punkter.length} slag`}>
      <rect x="10" y="20" width="300" height="220" rx="8" fill="var(--phn-sand-100)" />
      {[-0.75, 0, 0.75].map((f) => {
        const c = Math.round(midt + f * spennY);
        return (
          <g key={f}>
            <line x1="20" x2="300" y1={y(c)} y2={y(c)} stroke="var(--phn-sand-300)" />
            <text x="22" y={(y(c) - 4)} className="gt">{c} m</text>
          </g>
        );
      })}
      <line x1={cx} x2={cx} y1="24" y2="236" stroke="var(--phn-g600)" strokeDasharray="4 3" />
      {mal != null && (
        <>
          <ellipse cx={cx} cy={y(mal)} rx={((3 * 140) / spennX)} ry={ry} fill="none" stroke="var(--phn-green-700)" strokeWidth="2" />
          <text x={cx} y={Math.max(32, y(mal) - ry - 6)} textAnchor="middle" className="gt" style={{ fill: "var(--phn-green-700)", fontWeight: 600 }}>Mål {Math.round(mal)} m ±3</text>
        </>
      )}
      <ellipse cx={x(u.side as number)} cy={y(u.carry as number)} rx={((2 * sideS * 140) / spennX)} ry={((2 * lenS * 100) / spennY)}
        fill="var(--phn-slag)" fillOpacity=".08" stroke="var(--phn-g900)" strokeWidth="1.5" strokeDasharray="5 4" />
      {punkter.map((s, i) => (
        <circle key={s.nr} className="phn-inn" style={{ animationDelay: `${i * 6}ms` }}
          cx={Math.max(16, Math.min(304, x(s.side)))} cy={Math.max(24, Math.min(236, y(s.carry)))} r="4"
          fill={s.ekstrem ? "var(--phn-amber-700)" : "var(--phn-slag)"} fillOpacity={s.ekstrem ? 1 : 0.75} />
      ))}
      <text x="20" y="254" className="gt">Venstre</text>
      <text x="300" y="254" textAnchor="end" className="gt">Høyre</text>
      <text x={cx} y="254" textAnchor="middle" className="gt">Mållinje</text>
    </svg>
  );
}

/* Spredning på green. Skissen er 1100 × 970 punkter, og greenen er 25 m bred = 715 punkter. */
const GRONN: [number, number][] = [[340, 250], [420, 190], [520, 175], [640, 200], [760, 250], [900, 290], [1010, 330], [1045, 410], [1010, 520], [920, 600], [780, 650], [640, 710], [520, 760], [430, 730], [370, 640], [335, 500], [330, 340]];
const GX = 660, GY = 470, PM = 715 / 25;

export function iGreen(x: number, y: number): boolean {
  let inn = false;
  for (let i = 0, j = GRONN.length - 1; i < GRONN.length; j = i++) {
    const [ax, ay] = GRONN[i], [bx, by] = GRONN[j];
    if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inn = !inn;
  }
  return inn;
}

function Green({ slag, med, mal, filter }: { slag: TmSlag[]; med: TmSlag[]; mal: number | null; filter: TmFilter }) {
  const [sikt, setSikt] = useState(0);
  const punkter = slag.filter(harPunkt);
  const tellPunkter = med.filter(harPunkt);
  if (!tellPunkter.length) return null;
  const u = snitt(tellPunkter);
  const ref = mal ?? (u.carry as number);
  const sdS = sd(tellPunkter, "side") ?? 0, sdL = sd(tellPunkter, "carry") ?? 0;
  const px = (s: { side: number }) => GX + (s.side + sikt) * PM;
  const py = (s: { carry: number }) => GY - (s.carry - ref) * PM;
  const sx = GX + sikt * PM;
  const paa = punkter.filter((s) => (!s.ekstrem || filter.ekstreme) && iGreen(px(s), py(s))).length;
  const flytt = (d: number) => setSikt((v) => Math.max(-10, Math.min(10, v + d)));
  const hvor = sikt === 0 ? "midt på greenen" : `${tmTall(Math.abs(sikt), Math.abs(sikt) % 1 ? 1 : 0)} m til ${sikt < 0 ? "venstre" : "høyre"}`;

  return (
    <section className="phn-kort">
      <div className="phn-sek-topp"><h2>Spredning på green</h2><span className="phn-kilde">Skisse av en green, 25 m bred</span></div>
      <div className="phn-green-ramme">
        <svg className="phn-green" viewBox="0 0 1100 970" aria-hidden="true">
          <polygon points={GRONN.map((p) => p.join(",")).join(" ")} fill="var(--phn-green-flate)" stroke="var(--phn-green-kant)" strokeWidth="10" />
          <line x1={sx} y1="970" x2={sx} y2={GY} stroke="var(--phn-hvit)" strokeWidth="5" strokeDasharray="18 12" opacity=".95" />
          <ellipse cx={(GX + ((u.side as number) + sikt) * PM)} cy={(GY - ((u.carry as number) - ref) * PM)} rx={(2 * sdS * PM)} ry={(2 * sdL * PM)}
            fill="rgba(37,99,235,.18)" stroke="var(--phn-hvit)" strokeWidth="4" strokeDasharray="14 10" />
          {punkter.map((s) => (
            <circle key={s.nr} cx={px(s)} cy={py(s)} r="13" fill={s.ekstrem ? "var(--phn-amber-700)" : "var(--phn-slag)"} stroke="var(--phn-hvit)" strokeWidth="4" />
          ))}
          <circle cx={sx} cy={GY} r="26" fill="none" stroke="var(--phn-hvit)" strokeWidth="6" />
          <circle cx={sx} cy={GY} r="7" fill="var(--phn-hvit)" />
        </svg>
      </div>
      <div className="phn-sikte">
        <button type="button" className="phn-knapp sek" onClick={() => flytt(-1)} aria-label="Flytt siktelinjen 1 m til venstre"><ChevronLeft className="phn-ikon" aria-hidden />1 m</button>
        <input type="range" min={-10} max={10} step={0.5} value={sikt} onChange={(e) => setSikt(Number(e.target.value))} aria-label="Siktelinje i meter. Minus er venstre, pluss er høyre" />
        <button type="button" className="phn-knapp sek" onClick={() => flytt(1)} aria-label="Flytt siktelinjen 1 m til høyre">1 m<ChevronRight className="phn-ikon" aria-hidden /></button>
      </div>
      <p className="phn-forklar" aria-live="polite">
        Siktelinje: <b>{hvor}</b> · <b className="phn-mono">{paa} av {filter.ekstreme ? punkter.length : punkter.filter((s) => !s.ekstrem).length}</b> slag ville landet på greenen.
        {mal == null && " Lengden er målt mot snittet ditt, siden økta ikke hadde mål."}
      </p>
    </section>
  );
}
