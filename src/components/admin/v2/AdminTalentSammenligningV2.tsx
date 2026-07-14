"use client";

/**
 * AgencyOS v2 — Talent · Sammenligning (`/admin/talent/sammenligning`,
 * AgencyOS Bølge 3.37, 2026-07-14). Port fra `(legacy)/talent/sammenligning/
 * page.tsx` + `map-compare-data.ts` + den delte v10-komponenten
 * `src/components/admin/talent/sammenligning.tsx` (TalentSammenligning),
 * som var enekonsument av skjermen (ingen andre skjermer importerte den —
 * ikke en reell «delt komponent på tvers», bare bygget i en v10-mappe).
 *
 * DATA-FUNN (fikset i denne porten, ikke bare re-skinnet): loaderen
 * (`loadMultiCompare`) beregner ekte per-spiller SG-verdier, en ekte
 * kohort-`sgTotal` per spiller og et utledet verdikt («X leder Y av Z
 * målte metrikker») — men både `map-compare-data.ts` og v10-komponenten
 * kastet disse bort og rendret «—»/tomtilstand UANSETT hvor mye ekte data
 * som fantes (v10-komponenten var en pixel-port av en tom-tilstand-fasit
 * og hardkodet «ingen data»/senterlinje-uten-søyle for alle rader). Denne
 * v2-porten viser de ekte tallene: per-spiller-verdier med best-badge,
 * kohort-søyler tegnet mot faktisk `sgTotal` (−2,0 → +2,0-skala), og
 * verdikt-setningen som et fremhevet varsel øverst.
 *
 * «Endre utvalg» var også dødt i legacy (lenket til seg selv uten
 * `?ids=`, ingen faktisk velger) — erstattet med en ekte `BunnArk`-velger
 * (søk + inntil 4 avkryssede spillere, samme idiom som Tester · Tildel).
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, HjelpTips, T, BunnArk, AvatarInit } from "@/components/v2";
import { Inndata } from "@/components/v2/skjema";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";

export interface SammenligningSpillerV2 {
  id: string;
  initials: string;
  name: string;
  metaTekst: string;
  hcpTekst: string;
  href: string;
}

export type SammenligningAksV2 = "sg" | "slag" | "tek" | "spill" | "turn" | "fys";

export interface SammenligningMetrikkV2 {
  id: string;
  akse: SammenligningAksV2;
  navn: string;
  sub: string;
  refLabel: string;
  refValueTekst: string;
  verdier: (string | null)[];
  besteIndex: number | null;
  hjelp?: HjelpNokkel;
}

export interface SammenligningPyramideRadV2 {
  akse: SammenligningAksV2;
  axisLabel: string;
  perSpiller: number[];
}

const AKSE_FARGE: Record<SammenligningAksV2, string> = {
  sg: T.fg2,
  slag: T.ax.SLAG,
  tek: T.ax.TEK,
  spill: T.ax.SPILL,
  turn: T.ax.TURN,
  fys: T.ax.FYS,
};

export interface SammenligningKohortRadV2 {
  userId: string;
  rank: number;
  initials: string;
  navn: string;
  subTekst: string;
  sgTotal: number | null;
  sgTekst: string;
  tagged: boolean;
  href?: string;
}

export interface SammenligningRegionV2 {
  id: string;
  navn: string;
  count: number;
  pct: number;
}

export interface SammenligningKandidatV2 {
  id: string;
  navn: string;
  hcpTekst: string;
}

export interface SammenligningDataV2 {
  verdict: string | null;
  players: SammenligningSpillerV2[];
  metrics: SammenligningMetrikkV2[];
  pyramide: SammenligningPyramideRadV2[];
  kohortCount: number;
  kohortSnittTekst: string;
  kohort: SammenligningKohortRadV2[];
  region: SammenligningRegionV2[];
  kandidater: SammenligningKandidatV2[];
  valgteIds: string[];
}

function SectionDividerV2({ num, label, sub, count }: { num: string; label: string; sub: string; count: string }) {
  return (
    <div style={{ marginTop: 28, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: T.fg }}>{num} · {label}</span>
      <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, color: T.mut }}>{sub}</span>
      <span style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ borderRadius: 9999, background: T.panel2, padding: "3px 9px", fontFamily: T.mono, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{count}</span>
    </div>
  );
}

function EndreUtvalgArkV2({ kandidater, valgteIds, onLukk }: { kandidater: SammenligningKandidatV2[]; valgteIds: string[]; onLukk: () => void }) {
  const router = useRouter();
  const [sok, setSok] = useState("");
  const [valgt, setValgt] = useState<string[]>(valgteIds);

  const filtrert = useMemo(
    () => kandidater.filter((k) => k.navn.toLowerCase().includes(sok.toLowerCase())),
    [kandidater, sok],
  );

  function toggle(id: string) {
    setValgt((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function bruk() {
    router.push(`/admin/talent/sammenligning?ids=${valgt.join(",")}`);
    onLukk();
  }

  return (
    <BunnArk tittel={<>Endre <em style={{ fontStyle: "italic", color: T.lime }}>utvalg</em></>} onLukk={onLukk} bredde={480}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Inndata label="Søk spiller" value={sok} onChange={setSok} placeholder="Skriv navn …" />
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Velg 2–4 spillere. {valgt.length} / 4 valgt.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
          {filtrert.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen spillere matcher søket.</div>
          ) : (
            filtrert.map((k) => {
              const on = valgt.includes(k.id);
              const deaktivert = !on && valgt.length >= 4;
              return (
                <label key={k.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: deaktivert ? "not-allowed" : "pointer", borderRadius: 10, border: `1px solid ${on ? T.lime : T.borderS}`, background: on ? `color-mix(in srgb, ${T.lime} 8%, transparent)` : T.panel2, padding: "9px 12px", opacity: deaktivert ? 0.5 : 1 }}>
                  <input type="checkbox" checked={on} disabled={deaktivert} onChange={() => toggle(k.id)} style={{ accentColor: T.lime }} />
                  <AvatarInit navn={k.navn} size={26} />
                  <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13, color: T.fg }}>{k.navn}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{k.hcpTekst}</span>
                </label>
              );
            })
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Knapp ghost onClick={onLukk}>Avbryt</Knapp>
          <Knapp icon="check" onClick={bruk} disabled={valgt.length < 2}>Bruk utvalg ({valgt.length})</Knapp>
        </div>
      </div>
    </BunnArk>
  );
}

function SideOmSidePanel({ data, onEndreUtvalg }: { data: SammenligningDataV2; onEndreUtvalg: () => void }) {
  const n = data.players.length;
  const gridCols = `210px repeat(${n || 1}, minmax(0, 1fr)) 110px`;

  return (
    <Kort pad="0">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${T.border}`, padding: "16px 20px" }}>
        <div>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>Talent-kohort <em style={{ fontStyle: "italic", color: T.lime }}>· konkurranseprofiler</em></div>
          <p style={{ marginTop: 4, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: T.mut }}>
            {n} {n === 1 ? "spiller" : "spillere"} i sammenligning · SG fra siste registrerte periode · referanse PGA Tour-baseline
          </p>
        </div>
        <Knapp ghost icon="user-plus" onClick={onEndreUtvalg}>Endre utvalg</Knapp>
      </div>

      {n === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen spillere valgt. Klikk «Endre utvalg» for å velge 2–4 spillere.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 640, display: "grid", gridTemplateColumns: gridCols, borderBottom: `1px solid ${T.border}`, background: T.panel2 }}>
            <div style={{ display: "flex", alignItems: "flex-end", borderRight: `1px solid ${T.border}`, padding: "14px 16px", fontFamily: T.mono, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>METRIKK</div>
            {data.players.map((p) => (
              <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 8, borderRight: `1px solid ${T.border}`, background: T.panel, padding: "14px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AvatarInit navn={p.name} size={36} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link href={p.href} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg, textDecoration: "none" }}>{p.name}</Link>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.mono, fontSize: 9, color: T.mut }}>{p.metaTekst}</span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", width: "fit-content", borderRadius: 4, background: T.panel3, padding: "2px 6px", fontFamily: T.mono, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: T.fg }}>{p.hcpTekst}</span>
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>REFERANSE</span>
                <HjelpTips k="tourBaseline" size={10} />
              </div>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>PGA Tour</span>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>BASELINE 0,0</span>
            </div>
          </div>

          {data.metrics.map((m, idx) => (
            <div key={m.id} style={{ minWidth: 640, display: "grid", gridTemplateColumns: gridCols, borderBottom: idx < data.metrics.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, borderRight: `1px solid ${T.border}`, background: T.panel2, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 4, height: 16, borderRadius: 2, background: AKSE_FARGE[m.akse], flex: "none" }} />
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 13, color: T.fg }}>{m.navn}</span>
                  {m.hjelp && <HjelpTips k={m.hjelp} size={10} />}
                </div>
                <span style={{ marginLeft: 12, fontFamily: T.mono, fontSize: 9, color: T.mut }}>{m.sub}</span>
              </div>
              {data.players.map((p, i) => {
                const erBest = m.besteIndex === i;
                const verdi = m.verdier[i];
                return (
                  <div key={p.id} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, borderRight: `1px solid ${T.border}`, padding: "12px 14px", background: erBest ? `color-mix(in srgb, ${T.lime} 8%, transparent)` : "transparent" }}>
                    <span style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: verdi ? (erBest ? T.lime : T.fg) : T.mut, opacity: verdi ? 1 : 0.5 }}>{verdi ?? "—"}</span>
                    {erBest ? (
                      <StatusPill tone="lime">Best</StatusPill>
                    ) : (
                      <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>{verdi ? " " : "ingen data"}</span>
                    )}
                  </div>
                );
              })}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3, background: T.panel2, padding: "12px 14px" }}>
                <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>{m.refLabel}</span>
                <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 800, color: T.fg }}>{m.refValueTekst}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${T.border}`, background: T.panel2, padding: "12px 20px", fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.5 }}>
        <strong style={{ color: T.fg }}>Prinsipp.</strong> Hver rad er én metrikk, kolonnene er spillerne. Referanse-kolonnen helt til høyre er PGA Tour-baseline (0,0). Verdier vises kun der spilleren har registrert SG i perioden.
      </div>
    </Kort>
  );
}

function PyramideSammenligningPanel({ data }: { data: SammenligningDataV2 }) {
  if (data.players.length === 0) return null;
  const maxCount = Math.max(1, ...data.pyramide.flatMap((r) => r.perSpiller));

  return (
    <div style={{ marginTop: 24 }}>
      <SectionDividerV2 num="2" label="Pyramide-fordeling" sub="Antall økter per akse · valgte spillere" count={`${data.players.length} spillere`} />
      <Kort>
        {data.pyramide.every((r) => r.perSpiller.every((v) => v === 0)) ? (
          <p style={{ textAlign: "center", padding: "24px 0", fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen treningsplaner registrert for de valgte spillerne.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.pyramide.map((rad) => (
              <div key={rad.axisLabel} style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 4, height: 14, borderRadius: 2, background: AKSE_FARGE[rad.akse], flex: "none" }} />
                  <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", color: T.fg }}>{rad.axisLabel}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {data.players.map((p, i) => {
                    const count = rad.perSpiller[i] ?? 0;
                    return (
                      <div key={p.id} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ height: 8, borderRadius: 4, background: T.panel2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: AKSE_FARGE[rad.akse], borderRadius: 4 }} />
                        </div>
                        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{p.initials} · {count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Kort>
    </div>
  );
}

function KohortPanel({ data }: { data: SammenligningDataV2 }) {
  return (
    <div>
      <SectionDividerV2 num="3" label="Kohort-rangering" sub="Én metrikk · hele stallen · sortert" count={`${data.kohortCount} spillere`} />
      <Kort pad="0">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${T.border}`, padding: "16px 20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>Hele stallen <em style={{ fontStyle: "italic", color: T.lime }}>· SG total</em></div>
              <HjelpTips k="sgTotal" size={11} />
            </div>
            <p style={{ marginTop: 4, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: T.mut }}>{data.kohortCount} SPILLERE I KOHORT · SNITT {data.kohortSnittTekst} · SORTERT HØYEST FØRST</p>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>Beste</span>
              <span style={{ width: 24, height: 3, borderRadius: 9999, background: T.up }} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>Svakeste</span>
              <span style={{ width: 24, height: 3, borderRadius: 9999, background: T.down }} />
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.kohort.map((r, i) => (
            <KohortRadItem key={r.userId} row={r} erSiste={i === data.kohort.length - 1} />
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, background: T.panel2, padding: "12px 20px", fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.5 }}>
          <strong style={{ color: T.fg }}>Prinsipp.</strong> Søylene er tegnet mot skalaen −2,0 → +2,0 med senterlinjen som nullpunkt (Tour-baseline) — søylen henger til høyre hvis positiv, venstre hvis negativ. Lime-merkede rader er med i side-om-side over. Spillere uten registrert SG vises nederst uten søyle.
        </div>
      </Kort>
    </div>
  );
}

function KohortRadItem({ row, erSiste }: { row: SammenligningKohortRadV2; erSiste: boolean }) {
  const harVerdi = row.sgTotal != null;
  const andel = harVerdi ? Math.min(1, Math.max(-1, row.sgTotal! / 2)) : 0;
  const positiv = (row.sgTotal ?? 0) >= 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 100px", alignItems: "center", gap: 14, padding: "10px 20px", borderBottom: erSiste ? "none" : `1px solid ${T.border}`, borderLeft: row.tagged ? `3px solid ${T.lime}` : "3px solid transparent", background: row.tagged ? `color-mix(in srgb, ${T.lime} 6%, transparent)` : "transparent" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span style={{ width: 18, textAlign: "center", fontFamily: T.mono, fontSize: 10.5, fontWeight: 800, color: row.rank === 1 ? T.lime : T.mut }}>{row.rank}</span>
        <AvatarInit navn={row.navn} size={26} />
        <div style={{ minWidth: 0 }}>
          {row.href ? (
            <Link href={row.href} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, color: T.fg, textDecoration: "none" }}>{row.navn}</Link>
          ) : (
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, color: T.fg }}>{row.navn}</span>
          )}
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{row.subTekst}</span>
        </div>
      </div>

      <div style={{ position: "relative", height: 24, borderRadius: 8, background: T.panel2, overflow: "hidden" }}>
        <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: T.fg2, zIndex: 2 }} />
        {harVerdi && (
          <span
            style={{
              position: "absolute", top: 3, bottom: 3, borderRadius: 5,
              background: positiv ? T.up : T.down,
              left: positiv ? "50%" : `${50 + andel * 50}%`,
              width: `${Math.abs(andel) * 50}%`,
            }}
          />
        )}
      </div>

      <div style={{ textAlign: "right" }}>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 13, fontWeight: 800, color: harVerdi ? T.fg : T.mut }}>{row.sgTekst}</span>
        {!harVerdi && <span style={{ display: "block", marginTop: 2, fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>Ingen SG</span>}
      </div>
    </div>
  );
}

function RegionPanel({ data }: { data: SammenligningDataV2 }) {
  const max = Math.max(1, ...data.region.map((b) => b.pct));
  return (
    <div>
      <SectionDividerV2 num="4" label="Region-fordeling" sub="Geografisk fordeling av stallen" count={`${data.region.length} regioner`} />
      <Kort pad="0">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "18px 20px" }}>
          {data.region.map((b) => (
            <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 14, borderRadius: 10, border: `1px solid ${T.border}`, padding: "12px 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="map-pin" size={13} style={{ color: T.lime }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 13.5, fontWeight: 700, color: T.fg }}>{b.navn}</span>
                </div>
                <div style={{ height: 8, borderRadius: 9999, background: T.panel2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(b.pct / max) * 100}%`, borderRadius: 9999, background: T.lime }} />
                </div>
              </div>
              <div style={{ textAlign: "right", fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: T.fg }}>{b.count}</span>
                <span style={{ marginLeft: 5, fontSize: 11, color: T.mut }}>· {b.pct}%</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, background: T.panel2, padding: "12px 20px", fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.5 }}>
          <strong style={{ color: T.fg }}>Prinsipp.</strong> Fordelingen viser hvor i landet stallen er — basert på registrert region (talent-program) eller hjemmeklubb. Spillere uten region samles under «Uten region». Geografi er kontekst, ikke uttaks-grunnlag.
        </div>
      </Kort>
    </div>
  );
}

export function AdminTalentSammenligningV2({ data }: { data: SammenligningDataV2 }) {
  const [utvalgOpen, setUtvalgOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Caps size={9}>Talent · B10 sammenligning</Caps>
          <Tittel em={data.players.length >= 2 ? `· ${data.players.length} spillere` : "· kohort & region"}>Side om side</Tittel>
          <p style={{ marginTop: 8, maxWidth: 720, fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut }}>
            Tre nivåer: 2–4 spillere parallelt, hele stallen rangert på SG, og geografisk fordeling. Referanse er PGA Tour-baseline.
          </p>
        </div>
        <Link href="/admin/talent/radar" style={{ display: "inline-flex", flex: "none", alignItems: "center", gap: 6, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "9px 16px", textDecoration: "none", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
          <Icon name="arrow-left" size={14} />Tilbake
        </Link>
      </div>

      {data.verdict && (
        <Kort style={{ position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 4, background: T.lime }} />
          <div style={{ paddingLeft: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="trophy" size={18} style={{ color: T.lime, flex: "none" }} />
            <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg }}>{data.verdict}</p>
          </div>
        </Kort>
      )}

      <SectionDividerV2 num="1" label="Side om side" sub="Samme parametre · best-badge per metrikk" count={`${data.players.length} spillere`} />
      <SideOmSidePanel data={data} onEndreUtvalg={() => setUtvalgOpen(true)} />

      <PyramideSammenligningPanel data={data} />
      <KohortPanel data={data} />
      <RegionPanel data={data} />

      {utvalgOpen && <EndreUtvalgArkV2 kandidater={data.kandidater} valgteIds={data.valgteIds} onLukk={() => setUtvalgOpen(false)} />}
    </div>
  );
}
