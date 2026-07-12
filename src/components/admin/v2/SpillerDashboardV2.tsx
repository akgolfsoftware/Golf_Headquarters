"use client";

/**
 * SPILLER-DASHBOARD (100 %) — alt om én spiller på én adresse.
 * Portet fra design-fasit ui_kits/agencyos/spiller-dashboard.jsx (skrevet i
 * Claude Design-prosjektet 2026-07-12, Anders' bestilling): hero + KPI-strip
 * + 7 faner: Oversikt · Utvikling · Plan · Helse · Turnering · Logg ·
 * Administrasjon. Dekker alle 26 spillerdata-domener fra prisma-inventaret.
 *
 * Kun ekte data — all formatering skjer server-side (page.tsx); denne
 * komponenten mottar ferdige strenger og viser ærlige tomtilstander der
 * data mangler. HjelpTips på faguttrykk (SG/ACWR/WAGR/HCP) per låst regel.
 */

import Link from "next/link";
import { useState } from "react";
import { T } from "@/lib/v2/tokens";
import {
  Kort,
  Caps,
  Icon,
  TomTilstand,
  StatusPill,
  AvatarInit,
  CTAPill,
  TilbakeLenke,
} from "@/components/v2";
import { HjelpTips } from "@/components/v2/hjelp";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";
import {
  AdminSpillerProfilV2,
  type AdminSpillerProfilV2Data,
} from "./AdminSpillerProfilV2";

/* ── Datakontrakt (alt ferdigformatert server-side) ─────────── */

export interface DashKpi {
  label: string;
  verdi: string;
  tone?: "lime" | "warn" | "down";
  hjelp?: HjelpNokkel;
}

export interface DashRadItem {
  venstre: string;
  tittel: string;
  sub?: string;
  hoyre?: string;
  hoyreTone?: "lime" | "warn" | "down" | "mut";
}

export interface DashFelt {
  k: string;
  v: string;
}

export interface DashSparkline {
  label: string;
  naa: string;
  serie: number[];
}

export interface SpillerDashboardV2Data {
  /** Oversikt-fanens innhold (eksisterende 360-seksjoner). */
  profil: AdminSpillerProfilV2Data;
  heroBadges: { label: string; tone: "lime" | "warn" | "down" }[];
  heroMeta: string;
  kpi: DashKpi[];
  wbHref: string;
  analyseHref: string;

  utvikling: {
    fysTester: DashRadItem[];
    maal: DashRadItem[];
    trackman: DashRadItem[];
    fremgangHref: string;
    testerHref: string;
  };
  plan: {
    sesong: { tittel: string; perioder: { navn: string; datoer: string; fokus: string; aktiv: boolean }[] } | null;
    teknisk: DashFelt[] | null;
    fysisk: DashFelt[] | null;
    planHref: string;
  };
  helse: {
    sparklines: DashSparkline[];
    skader: { tittel: string; sub: string; aktiv: boolean }[];
  };
  turnering: {
    kommende: DashRadItem[];
    resultater: DashRadItem[];
    wagr: { rank: string; endring: string | null; ptsAvg: string } | null;
  };
  logg: {
    varsler: DashRadItem[];
    notater: { tittel: string; tekst: string; dato: string }[];
    videoer: DashRadItem[];
    dokumenter: DashRadItem[];
    caddie: { tekst: string; sub: string } | null;
  };
  admin: {
    personalia: DashFelt[];
    foresatte: DashRadItem[];
    samtykke: { vis: boolean; tekst: string; ok: boolean };
    okonomi: DashFelt[];
    betalinger: DashRadItem[];
    bookinger: DashRadItem[];
    utstyr: DashFelt[] | null;
    redigerHref: string;
  };
}

/* ── Små byggeklosser ───────────────────────────────────────── */

const TONE_FARGE = { lime: T.lime, warn: T.warn, down: T.down, mut: T.mut } as const;

function RadListe({ items, tomIcon, tomTitle, tomSub }: { items: DashRadItem[]; tomIcon: string; tomTitle: string; tomSub: string }) {
  if (!items.length) return <TomTilstand icon={tomIcon} title={tomTitle} sub={tomSub} />;
  return (
    <div>
      {items.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none" }}>
          <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut, width: 64, flex: "none" }}>{r.venstre}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.tittel}</div>
            {r.sub && <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut, marginTop: 3 }}>{r.sub}</div>}
          </div>
          {r.hoyre && (
            <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: r.hoyreTone ? TONE_FARGE[r.hoyreTone] : T.fg2, flex: "none" }}>{r.hoyre}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function FeltListe({ felter }: { felter: DashFelt[] }) {
  return (
    <div>
      {felter.map((f, i) => (
        <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < felter.length - 1 ? `1px solid ${T.border}` : "none" }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.mut, width: 96, flex: "none" }}>{f.k}</span>
          <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, fontWeight: 500, color: T.fg }}>{f.v}</span>
        </div>
      ))}
    </div>
  );
}

function MiniSpark({ serie, accent = T.lime }: { serie: number[]; accent?: string }) {
  if (serie.length < 2) return null;
  const w = 120;
  const h = 34;
  const mn = Math.min(...serie);
  const mx = Math.max(...serie);
  const pts = serie.map((v, i) => `${(i / (serie.length - 1)) * w},${h - 4 - ((v - mn) / (mx - mn || 1)) * (h - 8)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }} aria-hidden>
      <polyline points={pts} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Faner ──────────────────────────────────────────────────── */

const FANER = [
  { id: "oversikt", label: "Oversikt", icon: "layout-dashboard" },
  { id: "utvikling", label: "Utvikling", icon: "trending-up" },
  { id: "plan", label: "Plan", icon: "calendar" },
  { id: "helse", label: "Helse", icon: "activity" },
  { id: "turnering", label: "Turnering", icon: "trophy" },
  { id: "logg", label: "Logg", icon: "message-circle" },
  { id: "admin", label: "Administrasjon", icon: "settings" },
] as const;

type FaneId = (typeof FANER)[number]["id"];

export function SpillerDashboardV2({ data }: { data: SpillerDashboardV2Data }) {
  const [fane, setFane] = useState<FaneId>("oversikt");
  const p = data.profil;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <TilbakeLenke href="/admin/spillere">Alle spillere</TilbakeLenke>
      </div>

      {/* Hero — identitet + badges + CTA-er */}
      <Kort>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
          <AvatarInit navn={p.navn} size={64} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: T.fg, margin: 0, lineHeight: 1.1 }}>{p.navn}</h2>
              {data.heroBadges.map((b) => (
                <StatusPill key={b.label} tone={b.tone}>{b.label}</StatusPill>
              ))}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 7, fontVariantNumeric: "tabular-nums" }}>{data.heroMeta}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link href={data.wbHref} style={{ textDecoration: "none" }}><CTAPill icon="layout-dashboard">Workbench</CTAPill></Link>
            <Link href={data.analyseHref} style={{ textDecoration: "none" }}><CTAPill ghost icon="bar-chart">Analyse</CTAPill></Link>
            <Link href="/admin/innboks" style={{ textDecoration: "none" }}><CTAPill ghost icon="message-circle">Melding</CTAPill></Link>
            <Link href="/admin/bookinger/ny" style={{ textDecoration: "none" }}><CTAPill ghost icon="calendar-plus">Book time</CTAPill></Link>
          </div>
        </div>
      </Kort>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7" style={{ gap: 10 }}>
        {data.kpi.map((k) => (
          <div key={k.label} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 13px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Caps size={8}>{k.label}</Caps>
              {k.hjelp && <HjelpTips k={k.hjelp} size={11} />}
            </span>
            <div style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: k.tone ? TONE_FARGE[k.tone] : T.fg, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{k.verdi}</div>
          </div>
        ))}
      </div>

      {/* Fanelinje */}
      <div role="tablist" aria-label="Spillerinformasjon" style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.border}`, overflowX: "auto" }}>
        {FANER.map((f) => {
          const on = fane === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={on}
              onClick={() => setFane(f.id)}
              className="v2-press v2-focus"
              style={{ height: 40, padding: "0 13px", background: "none", border: "none", borderBottom: `2px solid ${on ? T.lime : "transparent"}`, color: on ? T.fg : T.mut, fontFamily: T.ui, fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", flex: "none" }}
            >
              <Icon name={f.icon} size={13} style={{ color: on ? T.lime : T.mut }} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Oversikt: eksisterende 360-seksjoner (uten dobbel hero) ── */}
      {fane === "oversikt" && <AdminSpillerProfilV2 data={p} variant="seksjoner" />}

      {/* ── Utvikling ── */}
      {fane === "utvikling" && (
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
          <Kort eyebrow="Aktive mål" action={<Link href={data.wbHref} style={{ textDecoration: "none" }}><Caps size={9}>Rediger i Workbench →</Caps></Link>}>
            <RadListe items={data.utvikling.maal} tomIcon="target" tomTitle="Ingen aktive mål" tomSub="Mål settes sammen med spilleren i Workbench." />
          </Kort>
          <Kort eyebrow="FYS-tester" action={<Link href={data.utvikling.testerHref} style={{ textDecoration: "none" }}><Caps size={9}>Alle tester →</Caps></Link>}>
            <RadListe items={data.utvikling.fysTester} tomIcon="dumbbell" tomTitle="Ingen FYS-tester" tomSub="Fysiske testresultater vises her." />
          </Kort>
          <Kort eyebrow="TrackMan · siste økter" action={<Link href={data.analyseHref} style={{ textDecoration: "none" }}><Caps size={9}>Analyse →</Caps></Link>}>
            <RadListe items={data.utvikling.trackman} tomIcon="crosshair" tomTitle="Ingen TrackMan-økter" tomSub="Økter synkes fra TrackMan-kontoen." />
          </Kort>
          <div className="lg:col-span-3">
            <Kort>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
                  Full SG-utvikling, treningsvolum og trening↔effekt-korrelasjon ligger i Fremgang-visningen.
                </span>
                <Link href={data.utvikling.fremgangHref} style={{ textDecoration: "none" }}><CTAPill ghost icon="trending-up">Åpne fremgang</CTAPill></Link>
              </div>
            </Kort>
          </div>
        </div>
      )}

      {/* ── Plan ── */}
      {fane === "plan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Sesongplan · periodisering" action={data.plan.sesong ? <Caps size={9}>{data.plan.sesong.tittel}</Caps> : undefined}>
            {data.plan.sesong ? (
              <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 10 }}>
                {data.plan.sesong.perioder.map((per, i) => (
                  <div key={i} style={{ padding: "11px 13px", borderRadius: 11, background: per.aktiv ? `color-mix(in srgb, ${T.lime} 10%, ${T.panel2})` : T.panel2, border: `1px solid ${per.aktiv ? T.lime : T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: per.aktiv ? T.lime : T.fg }}>{per.navn}</span>
                      {per.aktiv && <StatusPill tone="lime">Aktiv</StatusPill>}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut, marginTop: 6 }}>{per.datoer}</div>
                    {per.fokus && <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2, marginTop: 5 }}>{per.fokus}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <TomTilstand icon="calendar" title="Ingen sesongplan" sub="Årsplanen lages i Workbench (årsplan-zoom)." />
            )}
          </Kort>
          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
            <Kort eyebrow="Treningsplan">
              {p.plan ? (
                <div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{p.plan.navn}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, margin: "6px 0 12px" }}>{p.plan.meta} · {p.plan.pct} % fullført</div>
                  <Link href={data.wbHref} style={{ textDecoration: "none" }}><CTAPill icon="layout-dashboard">Åpne Workbench</CTAPill></Link>
                </div>
              ) : (
                <TomTilstand icon="calendar" title="Ingen aktiv plan" sub="Start fra mal i Workbench." />
              )}
            </Kort>
            <Kort eyebrow="Teknisk plan" action={<Link href={data.plan.planHref} style={{ textDecoration: "none" }}><Caps size={9}>Detaljer →</Caps></Link>}>
              {data.plan.teknisk ? <FeltListe felter={data.plan.teknisk} /> : <TomTilstand icon="wrench" title="Ingen teknisk plan" sub="L-fase-periodisert svingarbeid vises her." />}
            </Kort>
            <Kort eyebrow="Fysisk program">
              {data.plan.fysisk ? <FeltListe felter={data.plan.fysisk} /> : <TomTilstand icon="dumbbell" title="Ingen fysisk plan" sub="Fysisk plan med uker og økter vises her." />}
            </Kort>
          </div>
        </div>
      )}

      {/* ── Helse ── */}
      {fane === "helse" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
          <Kort eyebrow="Daglige målinger · siste 7 dager">
            {data.helse.sparklines.length ? (
              <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14 }}>
                {data.helse.sparklines.map((s) => (
                  <div key={s.label} style={{ padding: "12px 13px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}` }}>
                    <Caps size={8}>{s.label}</Caps>
                    <div style={{ fontFamily: T.mono, fontSize: 19, fontWeight: 700, color: T.fg, margin: "7px 0" }}>{s.naa}</div>
                    <MiniSpark serie={s.serie} />
                  </div>
                ))}
              </div>
            ) : (
              <TomTilstand icon="activity" title="Ingen helsedata" sub="Spilleren logger ikke daglige målinger (søvn, hvilepuls) ennå." />
            )}
          </Kort>
          <Kort eyebrow="Skade og permisjon">
            {data.helse.skader.length ? (
              <div style={{ position: "relative", paddingLeft: 18 }}>
                <div style={{ position: "absolute", left: 4, top: 4, bottom: 4, width: 2, background: T.border }} />
                {data.helse.skader.map((s, i) => (
                  <div key={i} style={{ position: "relative", paddingBottom: i < data.helse.skader.length - 1 ? 16 : 0 }}>
                    <span style={{ position: "absolute", left: -18, top: 3, width: 9, height: 9, borderRadius: 9999, background: s.aktiv ? T.warn : T.up, border: `2px solid ${T.panel}` }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{s.tittel}</span>
                      <StatusPill tone={s.aktiv ? "warn" : "up"}>{s.aktiv ? "Pågår" : "Tilbake"}</StatusPill>
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, marginTop: 6 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            ) : (
              <TomTilstand icon="shield-check" title="Ingen registrerte skader" sub="Permisjoner og skader (Leave) vises her." />
            )}
          </Kort>
        </div>
      )}

      {/* ── Turnering ── */}
      {fane === "turnering" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            <Kort eyebrow="Kommende turneringer" action={<Link href="/admin/tournaments" style={{ textDecoration: "none" }}><Caps size={9}>Meld på →</Caps></Link>}>
              <RadListe items={data.turnering.kommende} tomIcon="trophy" tomTitle="Ingen påmeldinger" tomSub="Kommende turneringer med nedtelling vises her." />
            </Kort>
            <Kort eyebrow="Siste resultater">
              <RadListe items={data.turnering.resultater} tomIcon="flag" tomTitle="Ingen resultater" tomSub="Turneringsresultater vises her." />
            </Kort>
          </div>
          <Kort eyebrow="WAGR · verdensranking" action={<HjelpTips k="wagr" size={12} />}>
            {data.turnering.wagr ? (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 34, fontWeight: 700, color: T.lime, letterSpacing: "-0.02em" }}>{data.turnering.wagr.rank}</span>
                  {data.turnering.wagr.endring && <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fg2 }}>{data.turnering.wagr.endring}</span>}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, marginTop: 8 }}>Poengsnitt {data.turnering.wagr.ptsAvg}</div>
              </div>
            ) : (
              <TomTilstand icon="globe" title="Ikke i WAGR" sub="Verdensranking vises når spilleren er registrert." />
            )}
          </Kort>
        </div>
      )}

      {/* ── Logg ── */}
      {fane === "logg" && (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            <Kort eyebrow="Aktivitet · varsler">
              <RadListe items={data.logg.varsler} tomIcon="bell" tomTitle="Ingen aktivitet" tomSub="Spillerens varsler og hendelser vises her." />
            </Kort>
            <Kort eyebrow="Coach-notater · private">
              {data.logg.notater.length ? (
                <div>
                  {data.logg.notater.map((n, i) => (
                    <div key={i} style={{ padding: "11px 0", borderBottom: i < data.logg.notater.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        {n.tittel && <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, color: T.fg }}>{n.tittel}</span>}
                        <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>{n.dato}</span>
                      </div>
                      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.5 }}>{n.tekst}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <TomTilstand icon="file-text" title="Ingen notater" sub="Dine private notater om spilleren (CoachNote)." />
              )}
            </Kort>
            <Kort eyebrow="AI-Caddie">
              {data.logg.caddie ? (
                <div>
                  <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.fg, lineHeight: 1.5 }}>«{data.logg.caddie.tekst}»</p>
                  <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut, marginTop: 7 }}>{data.logg.caddie.sub}</div>
                </div>
              ) : (
                <TomTilstand icon="message-circle" title="Ingen caddie-samtaler" sub="Spillerens AI-dialog vises her (lesetilgang)." />
              )}
            </Kort>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            <Kort eyebrow="Video · swing">
              <RadListe items={data.logg.videoer} tomIcon="play" tomTitle="Ingen videoer" tomSub="Coaching-video og swing-opplastinger vises her." />
            </Kort>
            <Kort eyebrow="Dokumenter">
              <RadListe items={data.logg.dokumenter} tomIcon="file-text" tomTitle="Ingen dokumenter" tomSub="Rapporter og delte filer vises her." />
            </Kort>
          </div>
        </div>
      )}

      {/* ── Administrasjon ── */}
      {fane === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            <Kort eyebrow="Personalia" action={<Link href={data.admin.redigerHref} style={{ textDecoration: "none" }}><Caps size={9}>Rediger →</Caps></Link>}>
              <FeltListe felter={data.admin.personalia} />
            </Kort>
            <Kort eyebrow="Foresatte og samtykke">
              {data.admin.samtykke.vis && (
                <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 10, background: `color-mix(in srgb, ${data.admin.samtykke.ok ? T.lime : T.warn} 8%, ${T.panel2})`, border: `1px solid color-mix(in srgb, ${data.admin.samtykke.ok ? T.lime : T.warn} 30%, ${T.border})`, marginBottom: 10 }}>
                  <Icon name="shield-check" size={14} style={{ color: data.admin.samtykke.ok ? T.lime : T.warn }} />
                  <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.fg }}>{data.admin.samtykke.tekst}</span>
                </div>
              )}
              <RadListe items={data.admin.foresatte} tomIcon="users" tomTitle="Ingen foresatte registrert" tomSub="Foreldrekoblinger vises her." />
            </Kort>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            <Kort eyebrow="Økonomi">
              <FeltListe felter={data.admin.okonomi} />
              <div style={{ marginTop: 10 }}>
                <RadListe items={data.admin.betalinger} tomIcon="credit-card" tomTitle="Ingen betalinger" tomSub="Stripe-betalinger vises her." />
              </div>
            </Kort>
            <Kort eyebrow="Bookinger" action={<Link href="/admin/bookinger" style={{ textDecoration: "none" }}><Caps size={9}>Alle →</Caps></Link>}>
              <RadListe items={data.admin.bookinger} tomIcon="calendar-plus" tomTitle="Ingen kommende timer" tomSub="Book direkte fra kalenderen." />
            </Kort>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            <Kort eyebrow="Utstyr (bag)">
              {data.admin.utstyr ? <FeltListe felter={data.admin.utstyr} /> : <TomTilstand icon="package" title="Ingen utstyrsdata" sub="Spillerens køllesett vises her." />}
            </Kort>
            <Kort eyebrow="Personvern">
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6 }}>
                Dataeksport, retting og sletting håndteres under Styring → GDPR. Alle endringer på persondata logges.
              </p>
            </Kort>
          </div>
        </div>
      )}
    </div>
  );
}
