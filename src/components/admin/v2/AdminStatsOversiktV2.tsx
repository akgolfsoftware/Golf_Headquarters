"use client";

/**
 * AgencyOS v2 — Stats-oversikt / admin-dashboard (`/admin/stats/overview`,
 * AgencyOS Bølge 3.19, 2026-07-14). Port fra `(legacy)/stats/overview/
 * page.tsx` + `raske-handlinger.tsx` — samme Prisma-datahenting (uendret i
 * page.tsx), `Reveal`/`CountUp` (delt, uendret) gjenbrukt for
 * scroll-inn-animasjon, samme ekte `sjekkDbHelse`-DB-ping-kontrakt.
 *
 * MERK (funnet under porten, ikke fikset): `hentSisteCommits()` i
 * page.tsx kjører `execSync("git -C /Users/anderskristiansen/...")` — en
 * hardkodet lokal filsti som aldri finnes i Vercel/denne sandkassen.
 * Fanges av try/catch (faller tilbake til tom liste, seksjonen skjules)
 * — ingen krasj, men «Siste commits» vises aldri i prod. Bevart uendret
 * (samme som legacy), meldt her for egen fiks-økt.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Reveal } from "@/components/stats/reveal";
import { CountUp } from "@/components/stats/count-up";
import { Caps, Tittel, Kort, StatusPill, Icon, T, type StatusTone } from "@/components/v2";
import type { DbHelseResultat } from "@/app/admin/(legacy)/stats/overview/actions";

export type SyncStatusV2 = "ok" | "stale" | "warning" | "error";
export interface SyncRadV2 { navn: string; status: SyncStatusV2; tid: string; detalj: string }
export interface CommitV2 { hash: string; melding: string }

export interface AdminStatsOversiktV2Data {
  totalBrukere: number;
  brukereSomHarSgInputs: number;
  totalSgInputs: number;
  totalSammenligninger: number;
  ventendeManuelleTurneringer: number;
  syncRader: SyncRadV2[];
  totalPgaSpillere: number;
  totalTurneringer: number;
  totalDeltakerRader: number;
  totalNorskeSpillere: number;
  sisteCommits: CommitV2[];
  klokkeslettTekst: string;
}

const SYNC_TONE: Record<SyncStatusV2, StatusTone> = { ok: "up", warning: "warn", stale: "warn", error: "down" };
const SYNC_ICON: Record<SyncStatusV2, string> = { ok: "check", warning: "alert-triangle", stale: "alert-triangle", error: "alert-triangle" };

function MiniStatV2({ label, value }: { label: string; value: number }) {
  return (
    <Kort>
      <Caps size={9}>{label}</Caps>
      <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: T.fg }}>{value.toLocaleString("nb-NO")}</div>
    </Kort>
  );
}

interface LaastHandling { tekst: string; grunn: string }
const LAAST: LaastHandling[] = [
  { tekst: "Kjør manuell sync av PGA-data", grunn: "Treffer DataGolf — kjøres fra ops" },
  { tekst: "Send ukentlig roundup nå", grunn: "Endepunkt ikke bygget" },
  { tekst: "Roter CRON_SECRET", grunn: "Hemmelighet — kjøres fra terminal" },
];

function RaskeHandlingerV2({ sjekkDbHelse }: { sjekkDbHelse: () => Promise<DbHelseResultat> }) {
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<DbHelseResultat | null>(null);

  function kjorDbHelse() {
    startTransition(async () => {
      setResultat(null);
      const r = await sjekkDbHelse();
      setResultat(r);
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: T.gap }}>
      <button
        type="button"
        onClick={kjorDbHelse}
        disabled={pending}
        style={{ display: "flex", flexDirection: "column", gap: 10, borderRadius: T.rCard, border: `1px solid ${T.border}`, background: T.panel, padding: 18, textAlign: "left", cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1 }}
      >
        <Icon name={pending ? "loader" : "play"} size={16} style={{ color: T.lime, ...(pending ? { animation: "v2spin2 1s linear infinite" } : null) }} />
        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>Sjekk DB-helse</span>
        {resultat && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: resultat.ok ? T.up : T.down }}>
            <Icon name={resultat.ok ? "check" : "alert-triangle"} size={11} />
            {resultat.ok ? `OK · ${resultat.latencyMs} ms · ${resultat.brukere} brukere` : `Feil · ${resultat.latencyMs} ms`}
          </span>
        )}
      </button>
      {LAAST.map((h) => (
        <div key={h.tekst} title={h.grunn} style={{ display: "flex", flexDirection: "column", gap: 10, borderRadius: T.rCard, border: `1px dashed ${T.border}`, background: `color-mix(in srgb, ${T.panel} 60%, transparent)`, padding: 18, cursor: "not-allowed" }}>
          <Icon name="play" size={16} style={{ color: T.mut }} />
          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.mut }}>{h.tekst}</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>{h.grunn}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminStatsOversiktV2({ data, sjekkDbHelse }: { data: AdminStatsOversiktV2Data; sjekkDbHelse: () => Promise<DbHelseResultat> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <style>{"@keyframes v2spin2{to{transform:rotate(360deg)}}"}</style>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Caps size={9}>AgencyOS · Stats</Caps>
          <Tittel em="tall">Plattformen i</Tittel>
          <p style={{ marginTop: 6, maxWidth: 640, fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.6, color: T.mut }}>
            Admin-dashboard for AK Golf Stats — brukere, SG-data, turneringsdatabase og pipeline-status, alt live fra databasen.
          </p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>
          <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.lime }} />
          Sist oppdatert {data.klokkeslettTekst}
        </span>
      </div>

      <Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: T.gap }}>
          <Kort>
            <Caps size={9}>Totale brukere</Caps>
            <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.fg }}><CountUp value={data.totalBrukere} /></div>
            <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 11, color: T.mut }}><span style={{ color: T.lime }}>{data.brukereSomHarSgInputs}</span> med SG-data</div>
          </Kort>
          <Kort>
            <Caps size={9}>SG-inputs</Caps>
            <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.fg }}><CountUp value={data.totalSgInputs} /></div>
            <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 11, color: T.mut }}><span style={{ color: T.lime }}>{data.totalSammenligninger}</span> sammenligninger</div>
          </Kort>
          <Kort>
            <Caps size={9}>Turneringer i DB</Caps>
            <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.fg }}><CountUp value={data.totalTurneringer} /></div>
            <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 11, color: T.mut }}><span style={{ color: T.lime }}>{data.totalDeltakerRader.toLocaleString("nb-NO")}</span> deltakerrader</div>
          </Kort>
          <Kort style={{ background: T.lime }}>
            <Caps size={9} color={T.onLime}>Norske spillere</Caps>
            <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.onLime }}><CountUp value={data.totalNorskeSpillere} /></div>
            <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 11, color: `color-mix(in srgb, ${T.onLime} 70%, transparent)` }}>av {data.totalPgaSpillere.toLocaleString("nb-NO")} PGA-spillere</div>
          </Kort>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: T.gap }}>
        {["Top 5 sider", "Trafikkilder"].map((tittel, i) => (
          <Reveal key={tittel} delay={i * 100}>
            <Kort action={<StatusPill tone="warn">Krever Plausible-integrasjon</StatusPill>}>
              <Caps size={9}>{tittel}</Caps>
              <div style={{ padding: "24px 0", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.6, color: T.mut }}>
                Data hentes fra Plausible Analytics.<br />Koble til Plausible API-nøkkel for å aktivere.
              </div>
            </Kort>
          </Reveal>
        ))}
      </div>

      <div>
        <Reveal><Caps size={9}>Database-status</Caps><Tittel mobile>Stats-databasen live.</Tittel></Reveal>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: T.gap }}>
          {[
            { lbl: "PGA-spillere", n: data.totalPgaSpillere },
            { lbl: "Turneringer", n: data.totalTurneringer },
            { lbl: "Deltakerrader", n: data.totalDeltakerRader },
            { lbl: "Norske spillere", n: data.totalNorskeSpillere },
          ].map((rad, i) => (
            <Reveal key={rad.lbl} delay={i * 40}><MiniStatV2 label={rad.lbl} value={rad.n} /></Reveal>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
        <Reveal><Caps size={9}>Sync-status</Caps><Tittel mobile>Pipeline — siste kjøring.</Tittel></Reveal>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {data.syncRader.map((s, i) => (
            <Reveal key={s.navn} delay={i * 40}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: 14, borderRadius: 10, border: `1px solid ${T.border}`, padding: "12px 14px" }}>
                <Icon name={SYNC_ICON[s.status]} size={15} style={{ color: SYNC_TONE[s.status] === "up" ? T.up : SYNC_TONE[s.status] === "down" ? T.down : T.warn }} />
                <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{s.navn}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{s.tid}</span>
                <StatusPill tone={SYNC_TONE[s.status]}>{s.detalj}</StatusPill>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
        <Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
            <div>
              <Caps size={9}>Modereringskø</Caps>
              <Tittel mobile>{data.ventendeManuelleTurneringer} ventende turneringer.</Tittel>
            </div>
            <Link href="/admin/stats/moderering" style={{ display: "inline-flex", flex: "none", alignItems: "center", gap: 8, borderRadius: 9999, background: T.lime, padding: "10px 18px", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.onLime, textDecoration: "none" }}>
              Til moderering<Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </Reveal>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: T.gap }}>
          {[
            { lbl: "Manuelle turneringer", n: data.ventendeManuelleTurneringer, haster: data.ventendeManuelleTurneringer > 5 },
            { lbl: "SG-inputs", n: data.totalSgInputs, haster: false },
            { lbl: "Sammenligninger", n: data.totalSammenligninger, haster: false },
            { lbl: "PGA-spillere i DB", n: data.totalPgaSpillere, haster: false },
          ].map((m, i) => (
            <Reveal key={m.lbl} delay={i * 40}>
              <Kort style={m.haster ? { border: `1px solid color-mix(in srgb, ${T.down} 40%, transparent)`, background: `color-mix(in srgb, ${T.down} 6%, transparent)` } : undefined}>
                <Caps size={9} color={m.haster ? T.down : undefined}>{m.lbl}</Caps>
                <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: m.haster ? T.down : T.fg }}>{m.n.toLocaleString("nb-NO")}</div>
              </Kort>
            </Reveal>
          ))}
        </div>
      </div>

      {data.sisteCommits.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <Reveal><Caps size={9}>Siste commits</Caps><Tittel mobile>Kodehistorikk — main branch.</Tittel></Reveal>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {data.sisteCommits.map((c, i) => (
              <Reveal key={c.hash} delay={i * 30}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel, padding: "10px 14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 6, background: `color-mix(in srgb, ${T.lime} 12%, transparent)`, padding: "3px 8px", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.lime }}>
                    <Icon name="git-compare" size={11} />{c.hash}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{c.melding}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, paddingBottom: 8 }}>
        <Reveal><Caps size={9}>Raske handlinger</Caps><Tittel mobile>Cron + admin-snarveier.</Tittel></Reveal>
        <div style={{ marginTop: 16 }}>
          <RaskeHandlingerV2 sjekkDbHelse={sjekkDbHelse} />
        </div>
      </div>
    </div>
  );
}
