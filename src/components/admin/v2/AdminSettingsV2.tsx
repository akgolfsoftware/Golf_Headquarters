"use client";

/**
 * AgencyOS Innstillinger — v2 (retning C «Presis»). Rekomponerer
 * /admin/settings (legacy) i v2-språket: Organisasjon / Team & roller /
 * Tilgang, drevet av EKTE Prisma-data fra ruten. Bygget utelukkende av
 * v2-komponentbiblioteket (src/components/v2) — ingen ad-hoc UI, ingen rå
 * hex (kun T.*).
 *
 * Faner er server-drevet (?tab=) — ikke useState/PillTabs' onChange — siden
 * dette er en server component-rute. Lenkene under er stylet identisk med
 * PillTabs (samme mønster som /admin/plans/[planId]).
 *
 * Ærlige tomrom: Organisasjon uten klubber og Team uten coacher viser
 * TomTilstand. Tilgang har ingen org-innstillingsmodell ennå — viser «—»
 * i stedet for påfunnede av/på-tilstander, med lenke til den ekte
 * CBAC-matrisen.
 */

import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  StatusPill,
  KpiFlis,
  CTAPill,
  TomTilstand,
  Icon,
  T,
} from "@/components/v2";

// ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────
export type AdminSettingsV2Tab = "org" | "team" | "tilgang";

export interface AdminSettingsV2Klubb {
  id: string;
  navn: string;
  /** Antall fasiliteter (prisma.location._count.facilities). */
  fasiliteter: number;
}

export interface AdminSettingsV2TeamRad {
  id: string;
  navn: string;
  /** "Head coach" (ADMIN) eller "Coach" (COACH). */
  rolle: string;
  /** Antall unike spillere på tvers av coachens grupper. */
  spillere: number;
  /** true for ADMIN — vises som «Eier»-chip (fasit). */
  eier: boolean;
}

export interface AdminSettingsV2Data {
  tab: AdminSettingsV2Tab;
  klubber: AdminSettingsV2Klubb[];
  team: AdminSettingsV2TeamRad[];
  /** Adresse til den ekte CBAC-tilgangsmatrisen (bygges separat). */
  tilgangHref: string;
}

const TABS: { id: AdminSettingsV2Tab; l: string }[] = [
  { id: "org", l: "Organisasjon" },
  { id: "team", l: "Team & roller" },
  { id: "tilgang", l: "Tilgang" },
];

/** Fasit-radene i Tilgang-fanen. Ingen org-innstillingsmodell → verdi «—». */
const TILGANGSRADER = [
  "Spillere ser egen data",
  "Foreldre-tilgang (junior)",
  "Coacher ser hele stallen",
  "WAGR-synk automatisk",
  "Faktura synlig for spiller",
];

/** Server-drevet fane-lenke, stylet identisk med PillTabs (@/components/v2/core). */
function FaneLenke({ tab, active }: { tab: (typeof TABS)[number]; active: boolean }) {
  return (
    <Link href={`/admin/settings?tab=${tab.id}`} style={{ textDecoration: "none" }}>
      <span
        className="v2-press v2-focus"
        style={{
          display: "inline-block",
          padding: "8px 15px",
          borderRadius: 9999,
          fontFamily: T.ui,
          fontSize: 13,
          fontWeight: 600,
          color: active ? T.onLime : T.fg2,
          background: active ? T.lime : T.panel2,
          border: `1px solid ${active ? "transparent" : T.border}`,
          whiteSpace: "nowrap",
        }}
      >
        {tab.l}
      </span>
    </Link>
  );
}

function KlubbKort({ k }: { k: AdminSettingsV2Klubb }) {
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AvatarInit navn={k.navn} size={40} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 15, fontWeight: 700, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {k.navn}
          </div>
          <div style={{ marginTop: 2 }}>
            <Caps size={9}>
              {`${k.fasiliteter} ${k.fasiliteter === 1 ? "fasilitet" : "fasiliteter"} · aktiv`}
            </Caps>
          </div>
        </div>
      </div>
    </Kort>
  );
}

function TeamRad({ m, last }: { m: AdminSettingsV2TeamRad; last: boolean }) {
  return (
    <Rad
      leading={<AvatarInit navn={m.navn} size={34} />}
      title={m.navn}
      sub={`${m.rolle} · ${m.spillere} ${m.spillere === 1 ? "spiller" : "spillere"}`}
      meta={<StatusPill tone={m.eier ? "lime" : "info"}>{m.eier ? "Eier" : "Coach"}</StatusPill>}
      trailing={null}
      last={last}
    />
  );
}

function OrgFane({ klubber }: { klubber: AdminSettingsV2Klubb[] }) {
  if (klubber.length === 0) {
    return (
      <Kort>
        <TomTilstand
          icon="building-2"
          title="Ingen klubber ennå"
          sub="Legg til klubber/anlegg under Anlegg — de dukker opp her når de er aktive."
        />
      </Kort>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: T.gap }}>
      {klubber.map((k) => (
        <KlubbKort key={k.id} k={k} />
      ))}
    </div>
  );
}

function TeamFane({ team }: { team: AdminSettingsV2TeamRad[] }) {
  if (team.length === 0) {
    return (
      <Kort>
        <TomTilstand icon="users" title="Ingen coacher registrert ennå" sub="Inviter en coach under Team for å se dem her." />
      </Kort>
    );
  }
  return (
    <Kort eyebrow="Team · roller" pad="6px 20px 8px">
      {team.map((m, i) => (
        <TeamRad key={m.id} m={m} last={i === team.length - 1} />
      ))}
    </Kort>
  );
}

function TilgangFane({ href }: { href: string }) {
  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 14 }}>
      <Kort pad="4px 20px">
        {TILGANGSRADER.map((label, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "15px 0",
              borderBottom: i < TILGANGSRADER.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 500, color: T.fg }}>{label}</span>
            {/* Org-innstillinger er ikke modellert ennå — ingen påfunnet av/på-tilstand */}
            <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut }}>—</span>
          </div>
        ))}
      </Kort>
      <Link href={href} style={{ textDecoration: "none", alignSelf: "flex-start" }}>
        <CTAPill ghost icon="shield-check">
          Full tilgangsmatrise per rolle
        </CTAPill>
      </Link>
    </div>
  );
}

export function AdminSettingsV2({ data }: { data: AdminSettingsV2Data }) {
  const hode = (
    <div>
      <Caps>System · Admin</Caps>
      <div style={{ marginTop: 10 }}>
        <Tittel em="& tilgang.">Organisasjon</Tittel>
      </div>
    </div>
  );

  const kpier = (
    <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Aktive klubber" value={data.klubber.length} />
      <KpiFlis label="Team-medlemmer" value={data.team.length} />
      <KpiFlis label="Med admin-tilgang" value={data.team.filter((m) => m.eier).length} />
    </div>
  );

  const faner = (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {TABS.map((t) => (
        <FaneLenke key={t.id} tab={t} active={data.tab === t.id} />
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpier}
      {faner}
      {data.tab === "org" && <OrgFane klubber={data.klubber} />}
      {data.tab === "team" && <TeamFane team={data.team} />}
      {data.tab === "tilgang" && <TilgangFane href={data.tilgangHref} />}
      <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0 }}>
        <Icon name="info" size={12} style={{ verticalAlign: -1, marginRight: 5, color: T.mut }} />
        Klubber, coacher og rolletilgang. Eierrollen styrer hvem som ser hva.
      </p>
    </div>
  );
}
