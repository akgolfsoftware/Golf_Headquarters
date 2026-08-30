"use client";

/**
 * AgencyOS Workspace · Prosjekter — Train-lock (T13-restside, 27.08.2026,
 * se docs/natt/D-LYS-OG-5T-BESLUTNING.md §0.8).
 *
 * Mønster-port av inline-JSX-en i page.tsx (Paper) — samme datakontrakt
 * (SampleProject/getProjectsForUser, uendret, se page.tsx). Gjenbruker
 * prosjekt-kort-mønsteret fra AdminWorkspaceHubTrainLock (ProsjektKort),
 * tilpasset denne sidens felter (company/vis/assigned-navn). Ingen egen
 * fasit tegner denne skjermen — port med tl-kit + tl-workspace-kit.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlCaps, TlKort, TlTittel, TlTomTilstand, TL_PRESS } from "../oppsett/tl-kit";
import { TlFilterChip, TlWorkspaceTabs } from "./tl-workspace-kit";

export type ProsjektStatus = "AKTIV" | "PAUSE" | "ARKIVERT";
export type ProsjektSelskap = "AK" | "MULLIGAN" | "WANG" | "SKARP" | "PRIVAT";
export type ProsjektSynlighet = "PRIVAT" | "AK" | "JUNIOR" | "SELSKAP" | "ALLE";

export interface WorkspaceProsjektKort {
  id: string;
  tittel: string;
  beskrivelse: string;
  selskap: ProsjektSelskap;
  synlighet: ProsjektSynlighet;
  status: ProsjektStatus;
  open: number;
  doing: number;
  done: number;
  total: number;
  pct: number;
  due: string;
  tildeltNavn: string[];
}

export interface AdminWorkspaceProsjekterData {
  prosjekter: WorkspaceProsjektKort[];
}

const SELSKAP_LABEL: Record<ProsjektSelskap, string> = {
  AK: "AK Golf",
  MULLIGAN: "Mulligan",
  WANG: "Wang Topp",
  SKARP: "Skarpnord",
  PRIVAT: "Privat",
};

const STATUS_LABEL: Record<ProsjektStatus, string> = { AKTIV: "Aktiv", PAUSE: "Pause", ARKIVERT: "Arkivert" };

function StatusMerke({ status }: { status: ProsjektStatus }) {
  const farge = status === "AKTIV" ? TL.ok : status === "PAUSE" ? TL.warn : TL.mute;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: farge,
        boxShadow: `inset 0 0 0 1px ${status === "PAUSE" ? TL.warnHair : TL.hair}`,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

const SYNLIGHET_IKON: Record<ProsjektSynlighet, string> = {
  PRIVAT: "lock",
  AK: "user",
  JUNIOR: "graduation-cap",
  SELSKAP: "building-2",
  ALLE: "globe",
};

function SynlighetIkon({ kind }: { kind: ProsjektSynlighet }) {
  return <Icon name={SYNLIGHET_IKON[kind]} size={13} style={{ color: TL.mute }} />;
}

function ProsjektKort({ p }: { p: WorkspaceProsjektKort }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TlCaps size={9}>{SELSKAP_LABEL[p.selskap]}</TlCaps>
          <StatusMerke status={p.status} />
        </div>
        <SynlighetIkon kind={p.synlighet} />
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: TL.text, letterSpacing: "-0.01em" }}>{p.tittel}</div>
        <p style={{ fontSize: 12.5, color: TL.mute, lineHeight: 1.5, margin: "6px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {p.beskrivelse}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { n: p.open, l: "Åpne", c: TL.text },
          { n: p.doing, l: "Pågår", c: TL.text },
          { n: p.done, l: "Ferdig", c: TL.ok },
          { n: p.total, l: "Totalt", c: TL.mute },
        ].map((s) => (
          <div key={s.l}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.c, fontVariantNumeric: "tabular-nums", lineHeight: 1, fontFamily: TL.font.mono }}>{s.n}</div>
            <TlCaps size={8.5}>{s.l}</TlCaps>
          </div>
        ))}
      </div>

      <div>
        <TlCaps size={9}>Fremdrift</TlCaps>
        <div style={{ marginTop: 8, height: 5, borderRadius: 999, background: TL.dim, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, width: `${p.pct}%`, background: TL.warm }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 12, borderTop: `1px solid ${TL.hair}` }}>
        {p.tildeltNavn.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            {p.tildeltNavn.slice(0, 3).map((a, i) => (
              <span
                key={i}
                style={{
                  marginLeft: i === 0 ? 0 : -8,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: TL.avatar,
                  color: TL.onAvatar,
                  fontSize: 10,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 0 2px ${TL.elev}`,
                }}
              >
                {a.trim().charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
        ) : (
          <TlCaps size={9}>Ikke tildelt</TlCaps>
        )}
        <TlCaps size={9}>{p.due}</TlCaps>
      </div>
    </div>
  );
}

function NyttProsjektKort() {
  return (
    <button
      type="button"
      className={TL_PRESS}
      style={{
        display: "flex",
        minHeight: 240,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: TL.radius.card,
        boxShadow: `inset 0 0 0 1.5px ${TL.hair}`,
        background: TL.dock,
        padding: 24,
        color: TL.mute,
        cursor: "pointer",
        border: "none",
      }}
    >
      <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 9999, boxShadow: `inset 0 0 0 1px ${TL.hair}`, background: TL.elev }}>
        <Icon name="plus" size={16} style={{ color: TL.mute }} />
      </span>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: TL.text }}>Nytt prosjekt</div>
      <div style={{ fontSize: 11, textAlign: "center", color: TL.mute, lineHeight: 1.6 }}>
        Sync med Notion eller opprett manuelt
      </div>
    </button>
  );
}

export function AdminWorkspaceProsjekterTrainLock({
  prosjekter,
  filter,
  somFane = false,
}: {
  prosjekter: WorkspaceProsjektKort[];
  filter: "alle" | "aktive" | "pause" | "arkiv";
  /**
   * True når komponenten står som fane i /admin/oppgaver (MASTERPLAN 15.2).
   * Da eier siden overskriften, og komponentens egen workspace-tabbrad er
   * fjernet — den navigerte mellom sider som nå ER faner. Uten flagget fikk
   * skjermen tre navigasjonsrader stablet, som er nøyaktig det 6.9 fjerner.
   */
  somFane?: boolean;
}) {
  const counts = {
    alle: prosjekter.length,
    aktive: prosjekter.filter((p) => p.status === "AKTIV").length,
    pause: prosjekter.filter((p) => p.status === "PAUSE").length,
    arkiv: prosjekter.filter((p) => p.status === "ARKIVERT").length,
  };
  const filtrert = prosjekter.filter((p) => {
    if (filter === "aktive") return p.status === "AKTIV";
    if (filter === "pause") return p.status === "PAUSE";
    if (filter === "arkiv") return p.status === "ARKIVERT";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        {somFane ? (
          <span style={{ fontSize: 13, color: TL.mute }}>
            {`${counts.alle} totalt · ${counts.aktive} aktive · ${counts.pause} på pause`}
          </span>
        ) : (
          <TlTittel sub={`${counts.alle} totalt · ${counts.aktive} aktive · ${counts.pause} på pause`}>Prosjekter</TlTittel>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <a href="https://notion.so" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 44,
                padding: "0 20px",
                borderRadius: TL.radius.pill,
                boxShadow: `inset 0 0 0 1px ${TL.hair}`,
                color: TL.mute,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <Icon name="external-link" size={14} />
              Notion
            </span>
          </a>
        </div>
      </div>

      {!somFane && <TlWorkspaceTabs active="prosjekter" />}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        <TlFilterChip label="Alle" count={counts.alle} active={filter === "alle"} href="?filter=alle" />
        <TlFilterChip label="Aktive" count={counts.aktive} active={filter === "aktive"} href="?filter=aktive" />
        <TlFilterChip label="Pause" count={counts.pause} active={filter === "pause"} href="?filter=pause" />
        <TlFilterChip label="Arkivert" count={counts.arkiv} active={filter === "arkiv"} href="?filter=arkiv" />
      </div>

      {prosjekter.length === 0 ? (
        <TlKort pad="18px 20px">
          <TlTomTilstand icon="external-link" title="Ingen prosjekter ennå" sub="Koble til Notion for å synke prosjekter automatisk, eller opprett et prosjekt manuelt." />
        </TlKort>
      ) : filtrert.length === 0 ? (
        <TlKort pad="18px 20px">
          <TlTomTilstand icon="external-link" title="Ingen prosjekter her" sub="Ingen prosjekter passer filteret akkurat nå." />
        </TlKort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {filtrert.map((p) => (
            <ProsjektKort key={p.id} p={p} />
          ))}
          <NyttProsjektKort />
        </div>
      )}
    </div>
  );
}
