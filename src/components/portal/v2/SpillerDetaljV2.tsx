"use client";

/**
 * PlayerHQ · Spiller-detalj (/portal/spiller/[spillerId]) — v2.
 * v2-port 17. juli 2026 (Team D3): erstatter spiller-detalj-client (hybrid).
 * Offentlig spillerprofil fra stall/lag-sider/søk: hero + KPI-rad + faner
 * (Oversikt · Plan · Statistikk · Runder · Coaching-historikk). Samme data-
 * kontrakt som før — page.tsx eier queries og snitt-utregningene.
 */

import Link from "next/link";
import { useState } from "react";
import {
  Kort,
  Caps,
  Tittel,
  KpiFlis,
  PillTabs,
  StatusPill,
  TomTilstand,
  CTAPill,
  Rad,
  DataTabell,
  type DataTabellColumn,
  SgKategorier,
  AvatarFoto,
  HjelpTips,
  T,
  fmtSg,
} from "@/components/v2";

export type SpillerData = {
  id: string;
  navn: string;
  initial: string;
  avatarUrl: string | null;
  hcp: number | null;
  homeClub: string | null;
  playingYears: number | null;
  ambition: string | null;
  memberSince: string;
  runder: {
    id: string;
    score: number;
    relativ: number;
    kursNavn: string;
    playedAt: string;
    sgTotal: number | null;
    sgPutt: number | null;
    sgOtt: number | null;
    sgApp: number | null;
    sgArg: number | null;
  }[];
  aktivPlan: { id: string; name: string } | null;
  coachingHistorikk: {
    id: string;
    scheduledAt: string;
    type: string;
    summary: string | null;
    coachNavn: string;
  }[];
  mal: {
    id: string;
    title: string;
    type: string;
    targetValue: number | null;
    currentValue: number | null;
    deadline: string | null;
  }[];
  stats: {
    antallRunder: number;
    snittScore: number | null;
    sgSnitt: number | null;
    antallOkter: number;
  };
};

type Tab = "oversikt" | "plan" | "statistikk" | "runder" | "coaching";

function relativStr(r: number): string {
  if (r === 0) return "E";
  return r > 0 ? `+${r}` : `${r}`;
}

function sgTekst(v: number | null): string {
  return v === null ? "—" : fmtSg(v);
}

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatKortDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

export function SpillerDetaljV2({ data }: { data: SpillerData }) {
  const [aktivTab, setAktivTab] = useState<Tab>("oversikt");

  const tabs = [
    { id: "oversikt", l: "Oversikt" },
    { id: "plan", l: "Plan" },
    { id: "statistikk", l: "Statistikk" },
    { id: "runder", l: `Runder${data.runder.length > 0 ? ` (${data.runder.length})` : ""}` },
    { id: "coaching", l: `Coaching${data.coachingHistorikk.length > 0 ? ` (${data.coachingHistorikk.length})` : ""}` },
  ];

  const fornavn = data.navn.split(" ")[0];
  const etternavn = data.navn.split(" ").slice(1).join(" ");

  return (
    <>
      {/* Hero */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }}>
        <AvatarFoto src={data.avatarUrl} navn={data.navn} size={64} ring />
        <div style={{ flex: 1, minWidth: 220 }}>
          <Tittel mobile em={etternavn}>{fornavn}</Tittel>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
            {data.hcp !== null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                HCP {String(data.hcp).replace(".", ",")}
                <HjelpTips k="hcp" size={11} />
              </span>
            )}
            {data.homeClub && <span>· {data.homeClub}</span>}
            {data.playingYears !== null && <span>· {data.playingYears} år med golf</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            <StatusPill tone="lime">Aktiv spiller</StatusPill>
            {data.aktivPlan && <StatusPill tone="info">{data.aktivPlan.name}</StatusPill>}
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "4px 9px" }}>
              Siden {formatKortDato(data.memberSince)}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href={`/portal/coach?spillerId=${data.id}`} style={{ textDecoration: "none" }}>
            <CTAPill icon="message-circle" full>Send melding</CTAPill>
          </Link>
          <Link href={`/portal/booking?spillerId=${data.id}`} style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="calendar-check" full>Book økt</CTAPill>
          </Link>
        </div>
      </div>

      {/* KPI-rad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: T.gap }}>
        <KpiFlis label="Runder" value={data.stats.antallRunder > 0 ? data.stats.antallRunder : "—"} instant />
        <KpiFlis label="Snitt-score (slag)" value={data.stats.snittScore !== null ? String(data.stats.snittScore).replace(".", ",") : "—"} instant />
        <KpiFlis label="SG totalt (slag)" value={sgTekst(data.stats.sgSnitt)} hjelp="sgTotal" instant />
        <KpiFlis label="Coaching-økter" value={data.stats.antallOkter > 0 ? data.stats.antallOkter : "—"} instant />
      </div>

      {/* Faner */}
      <PillTabs tabs={tabs} value={aktivTab} onChange={(id) => setAktivTab(id as Tab)} />

      {aktivTab === "oversikt" && <OversiktTab data={data} />}
      {aktivTab === "plan" && <PlanTab data={data} />}
      {aktivTab === "statistikk" && <StatistikkTab data={data} />}
      {aktivTab === "runder" && <RunderTab data={data} />}
      {aktivTab === "coaching" && <CoachingTab data={data} />}
    </>
  );
}

/* ── Oversikt ─────────────────────────────────────────── */

function OversiktTab({ data }: { data: SpillerData }) {
  const profilRader: { k: string; v: string }[] = [
    { k: "Navn", v: data.navn },
    { k: "HCP", v: data.hcp !== null ? String(data.hcp).replace(".", ",") : "—" },
    { k: "Klubb", v: data.homeClub ?? "—" },
    { k: "År med golf", v: data.playingYears !== null ? `${data.playingYears} år` : "—" },
    { k: "Mål/ambisjon", v: data.ambition ?? "—" },
    { k: "Medlem siden", v: formatKortDato(data.memberSince) },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: T.gap, alignItems: "start" }}>
      <Kort eyebrow="Profil">
        {profilRader.map(({ k, v }, i) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8, padding: "8px 0", borderBottom: i === profilRader.length - 1 ? "none" : `1px solid ${T.border}` }}>
            <span style={{ alignSelf: "center", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>{k}</span>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>{v}</span>
          </div>
        ))}
      </Kort>

      <Kort eyebrow="Siste runder">
        {data.runder.length === 0 ? (
          <TomTilstand icon="flag" title="Ingen runder ennå" sub="Ingen runder logget ennå." />
        ) : (
          data.runder.slice(0, 5).map((r, i) => (
            <Rad
              key={r.id}
              title={r.kursNavn}
              sub={`${formatKortDato(r.playedAt)}${r.sgTotal !== null ? ` · SG ${fmtSg(r.sgTotal)}` : ""}`}
              meta={
                <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                  {r.score} <span style={{ color: r.relativ <= 0 ? T.up : T.mut }}>({relativStr(r.relativ)})</span>
                </span>
              }
              trailing={null}
              last={i === Math.min(data.runder.length, 5) - 1}
            />
          ))
        )}
      </Kort>

      <Kort eyebrow="Aktive mål">
        {data.mal.length === 0 ? (
          <TomTilstand icon="target" title="Ingen aktive mål" sub="Spilleren har ingen aktive mål registrert." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.mal.map((m) => (
              <div key={m.id}>
                <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.4 }}>{m.title}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, marginTop: 3 }}>
                  {m.deadline ? `Frist ${formatKortDato(m.deadline)}` : m.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </Kort>
    </div>
  );
}

/* ── Plan ─────────────────────────────────────────────── */

function PlanTab({ data }: { data: SpillerData }) {
  if (!data.aktivPlan) {
    return (
      <Kort>
        <TomTilstand
          icon="calendar"
          title="Ingen aktiv plan"
          sub="Spilleren har ikke en aktiv treningsplan for øyeblikket."
        />
      </Kort>
    );
  }
  return (
    <Kort eyebrow="Aktiv plan">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 700, color: T.fg }}>{data.aktivPlan.name}</div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "6px 0 0" }}>
            Planen vises fullt ut i Workbench.
          </p>
        </div>
        <Link href="/portal/tren" style={{ textDecoration: "none" }}>
          <CTAPill icon="arrow-right">Se plan</CTAPill>
        </Link>
      </div>
    </Kort>
  );
}

/* ── Statistikk ───────────────────────────────────────── */

function snittAv(runder: SpillerData["runder"], felt: "sgPutt" | "sgOtt" | "sgApp" | "sgArg"): number | null {
  const med = runder.filter((r) => r[felt] !== null);
  if (med.length === 0) return null;
  return med.reduce((s, r) => s + (r[felt] ?? 0), 0) / med.length;
}

function StatistikkTab({ data }: { data: SpillerData }) {
  const kategorier = [
    { akse: "OTT", sg: snittAv(data.runder, "sgOtt") },
    { akse: "APP", sg: snittAv(data.runder, "sgApp") },
    { akse: "ARG", sg: snittAv(data.runder, "sgArg") },
    { akse: "PUTT", sg: snittAv(data.runder, "sgPutt") },
  ].filter((k): k is { akse: string; sg: number } => k.sg !== null);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: T.gap }}>
        <KpiFlis label="Runder totalt" value={data.stats.antallRunder} instant />
        <KpiFlis label="Snitt-score (slag)" value={data.stats.snittScore !== null ? String(data.stats.snittScore).replace(".", ",") : "—"} instant tint />
        <KpiFlis label="SG totalt (slag)" value={sgTekst(data.stats.sgSnitt)} hjelp="sgTotal" instant />
        <KpiFlis label="Coaching-økter" value={data.stats.antallOkter} instant />
      </div>

      {kategorier.length > 0 ? (
        <SgKategorier kategorier={kategorier} baseline="Broadie" hjelp="sgOmrade" />
      ) : (
        <Kort>
          <TomTilstand icon="bar-chart" title="Ingen SG-data" sub="Ingen runder med Strokes Gained-data registrert ennå." />
        </Kort>
      )}
    </>
  );
}

/* ── Runder ───────────────────────────────────────────── */

const RUNDE_COLS: DataTabellColumn[] = [
  { key: "bane", label: "Bane" },
  { key: "dato", label: "Dato", mono: true, align: "right" },
  { key: "score", label: "Score (slag)", mono: true, align: "right", sortable: true },
  { key: "rel", label: "Mot par", mono: true, align: "right" },
  { key: "sgTotal", label: "SG totalt", delta: true, align: "right", sortable: true },
  { key: "sgPutt", label: "SG putt", delta: true, align: "right" },
];

function RunderTab({ data }: { data: SpillerData }) {
  if (data.runder.length === 0) {
    return (
      <Kort>
        <TomTilstand icon="flag" title="Ingen runder ennå" sub="Spilleren har ikke logget noen runder ennå." />
      </Kort>
    );
  }

  return (
    <Kort eyebrow="Runder · siste 10">
      <div style={{ overflowX: "auto" }}>
        <DataTabell
          columns={RUNDE_COLS}
          rows={data.runder.map((r) => ({
            bane: r.kursNavn,
            dato: formatKortDato(r.playedAt),
            score: r.score,
            rel: relativStr(r.relativ),
            sgTotal: r.sgTotal,
            sgPutt: r.sgPutt,
          }))}
          sortKey="dato"
          sortDir="desc"
          mobilKort
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {data.runder.slice(0, 3).map((r) => (
          <Link key={r.id} href={`/portal/statistikk/runder/${r.id}/del`} style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="external-link">
              Del {r.kursNavn} ({formatKortDato(r.playedAt)})
            </CTAPill>
          </Link>
        ))}
      </div>
    </Kort>
  );
}

/* ── Coaching-historikk ───────────────────────────────── */

function CoachingTab({ data }: { data: SpillerData }) {
  if (data.coachingHistorikk.length === 0) {
    return (
      <Kort>
        <TomTilstand icon="users" title="Ingen coaching-historikk" sub="Spilleren har ingen registrerte coaching-økter ennå." />
      </Kort>
    );
  }

  return (
    <Kort eyebrow="Coaching-historikk">
      {data.coachingHistorikk.map((okt, i) => (
        <Rad
          key={okt.id}
          title={formatDato(okt.scheduledAt)}
          sub={`Coach: ${okt.coachNavn}${okt.summary ? ` · ${okt.summary}` : ""}`}
          meta={
            <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px" }}>
              {okt.type}
            </span>
          }
          trailing={null}
          last={i === data.coachingHistorikk.length - 1}
        />
      ))}
    </Kort>
  );
}
