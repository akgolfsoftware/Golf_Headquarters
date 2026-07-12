"use client";

/**
 * AgencyOS — Spillerprofil 360° i v2 (retning C «Presis»).
 *
 * Rekomponering av /admin/spillere/[id]/page.tsx til v2-idiomet. All FUNKSJON og
 * hele DATAKONTRAKTEN fra den ekte skjermen er bevart — server-siden gjør Prisma-
 * uthenting + all utleding (coach-flagg, pyramide-adherence, aktiv plan, meldinger)
 * og sender ferdig-mappet AdminSpillerProfilV2Data hit. Denne filen rendrer bare,
 * utelukkende av v2-komponentbiblioteket (src/components/v2) — ingen ad-hoc UI,
 * ingen rå hex (kun T.*).
 *
 * Desktop-rekkefølge: tilbake-lenke → hero-kort → grid 1.3fr/1fr:
 *   venstre  = coach-flagg (betinget) · treningspyramide + innsikt · siste runder & tester
 *   høyre    = aktiv plan · hurtighandlinger · meldinger
 * Ærlige tomrom: manglende data vises som TomTilstand, aldri fabrikerte tall.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  T,
  Kort,
  Caps,
  CTAPill,
  TilbakeLenke,
  StatusPill,
  AvatarInit,
  InnsiktChip,
  TomTilstand,
  Rad,
  VarselRad,
  Pyramide,
  ProgresjonsBar,
  DataTabell,
  Icon,
  type StatusTone,
  type DataTabellColumn,
  type DataTabellRow,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";

// ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────
export interface SpillerProfilFlagg {
  chip: string;
  tone: Extract<StatusTone, "down" | "warn">;
  tekst: string;
  ctaLabel: string;
  ctaHref: string;
}
export interface SpillerProfilPyrRad {
  akse: AkseKey;
  pct: number;
}
export interface SpillerProfilHendelse {
  id: string;
  ord: number;
  dato: string;
  hendelse: string;
  resultat: string;
  sg: number | null;
}
export interface SpillerProfilPlan {
  navn: string;
  meta: string;
  pct: number;
  href: string;
}
export interface SpillerProfilHandling {
  label: string;
  icon: string;
  href: string;
}
export interface SpillerProfilMelding {
  when: string;
  type: string;
  tekst: string;
  href: string;
  pending: boolean;
}
export interface AdminSpillerProfilV2Data {
  id: string;
  navn: string;
  eyebrow: string;
  meta: string;
  analyseHref: string;
  meldingHref: string;
  wbHref: string;
  flagg: SpillerProfilFlagg | null;
  weekLabel: string;
  pyramide: SpillerProfilPyrRad[];
  verstLabel: string | null;
  verstBakPp: number;
  hendelser: SpillerProfilHendelse[];
  plan: SpillerProfilPlan | null;
  handlinger: SpillerProfilHandling[];
  melding: SpillerProfilMelding | null;
}

const TABELL_KOLONNER: DataTabellColumn[] = [
  { key: "dato", label: "Dato", align: "left" },
  { key: "hendelse", label: "Hendelse", align: "left" },
  { key: "resultat", label: "Resultat", mono: true, align: "right" },
  { key: "sg", label: "SG", delta: true, align: "right", sortable: true },
];

export function AdminSpillerProfilV2({ data }: { data: AdminSpillerProfilV2Data }) {
  const router = useRouter();

  // ── Hero ───────────────────────────────────────────────────
  const heroKnapper: { label: string; icon: string; href: string; ghost: boolean }[] = [
    { label: "Analyse", icon: "bar-chart", href: data.analyseHref, ghost: true },
    { label: "Melding", icon: "message-circle", href: data.meldingHref, ghost: true },
    { label: "Ny plan", icon: "list", href: data.wbHref, ghost: true },
    { label: "Ny økt", icon: "plus", href: data.wbHref, ghost: false },
  ];
  const hero = (
    <Kort>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
        <AvatarInit navn={data.navn} size={64} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <Caps size={9}>{data.eyebrow || "—"}</Caps>
          <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: T.fg, margin: "6px 0 0", lineHeight: 1.1 }}>
            {data.navn}
          </h2>
          {data.meta && (
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              {data.meta}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {heroKnapper.map((b) => (
            <Link key={b.label} href={b.href} style={{ textDecoration: "none" }}>
              <CTAPill icon={b.icon} ghost={b.ghost}>{b.label}</CTAPill>
            </Link>
          ))}
        </div>
      </div>
    </Kort>
  );

  // ── Coach-flagg (kun fra ekte data, ellers skjult) ─────────
  const flagg = data.flagg && (
    <Kort tint eyebrow="Coach-flagg" action={<StatusPill tone={data.flagg.tone}>{data.flagg.chip}</StatusPill>}>
      <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: 0 }}>{data.flagg.tekst}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Link href={data.flagg.ctaHref} style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">{data.flagg.ctaLabel}</CTAPill>
        </Link>
        <Link href="/admin/godkjenninger" style={{ textDecoration: "none" }}>
          <CTAPill ghost>Avvis</CTAPill>
        </Link>
      </div>
    </Kort>
  );

  // ── Treningspyramide + innsikt ─────────────────────────────
  const pyramide = (
    <Kort eyebrow="Treningspyramide" action={<Caps size={9}>{data.weekLabel}</Caps>}>
      {data.pyramide.length > 0 ? (
        <>
          <Pyramide data={data.pyramide.map((p) => ({ akse: p.akse, value: p.pct, plan: 100 }))} />
          {data.verstLabel && (
            <div style={{ marginTop: 14 }}>
              <InnsiktChip>
                {data.verstLabel} ligger {data.verstBakPp} pp bak planen denne uka — prioriter dette i neste økt.
              </InnsiktChip>
            </div>
          )}
        </>
      ) : (
        <TomTilstand
          icon="calendar"
          title="Ingen planlagte økter denne uka"
          sub="Pyramiden vises når spilleren har en aktiv plan."
        />
      )}
    </Kort>
  );

  // ── Siste runder & tester ──────────────────────────────────
  const historikk = (
    <Kort eyebrow="Siste runder & tester">
      {data.hendelser.length > 0 ? (
        <DataTabell columns={TABELL_KOLONNER} rows={data.hendelser as unknown as DataTabellRow[]} sortKey="ord" sortDir="asc" />
      ) : (
        <TomTilstand icon="list" title="Ingen runder eller tester ennå" sub="Registrerte runder og tester dukker opp her." />
      )}
    </Kort>
  );

  // ── Aktiv plan ─────────────────────────────────────────────
  const plan = data.plan ? (
    <Link href={data.plan.href} style={{ textDecoration: "none" }}>
      <Kort hover eyebrow="Aktiv plan" action={<StatusPill tone="lime">Aktiv</StatusPill>}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{data.plan.navn}</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, margin: "6px 0 12px", fontVariantNumeric: "tabular-nums" }}>
          {data.plan.meta}
        </div>
        <ProgresjonsBar variant="bar" value={data.plan.pct} max={100} label="Fullført" />
      </Kort>
    </Link>
  ) : (
    <Kort eyebrow="Aktiv plan">
      <TomTilstand icon="calendar" title="Ingen aktiv plan" sub="Lag en plan i Workbench for å komme i gang." />
      <div style={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
        <Link href={data.wbHref} style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="plus">Lag plan i Workbench</CTAPill>
        </Link>
      </div>
    </Kort>
  );

  // ── Hurtighandlinger ───────────────────────────────────────
  const handlinger = (
    <Kort eyebrow="Hurtighandlinger" pad="8px 20px">
      {data.handlinger.map((h, i) => (
        <Rad
          key={h.label}
          onClick={() => router.push(h.href)}
          leading={
            <span style={{ width: 34, height: 34, borderRadius: 11, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon name={h.icon} size={16} style={{ color: T.lime }} />
            </span>
          }
          title={h.label}
          last={i === data.handlinger.length - 1}
        />
      ))}
    </Kort>
  );

  // ── Meldinger ──────────────────────────────────────────────
  const meldinger = (
    <Kort eyebrow="Meldinger">
      {data.melding ? (
        <VarselRad
          icon="message-circle"
          tittel={`${data.melding.type} · ${data.melding.when}`}
          sub={`«${data.melding.tekst}»`}
          tid=""
          ulest={data.melding.pending}
          last
          onClick={() => router.push(data.melding!.href)}
        />
      ) : (
        <TomTilstand icon="message-circle" title="Ingen meldinger ennå" sub="Meldinger og godkjenninger vises her." />
      )}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <TilbakeLenke href="/admin/spillere">Alle spillere</TilbakeLenke>
      </div>
      {hero}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {flagg}
          {pyramide}
          {historikk}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {plan}
          {handlinger}
          {meldinger}
        </div>
      </div>
    </div>
  );
}
