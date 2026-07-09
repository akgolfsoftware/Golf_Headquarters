"use client";

/**
 * AgencyOS Agenter — v2 (retning C «Presis»). Coach/ADMIN ser AI-agent-pipelinen
 * (appens eget agent-OS: AgentRun). Ingen mockup fantes — komponert utelukkende
 * av v2-biblioteket (src/components/v2), ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen (src/app/admin/agents):
 *   - 3 KPI-er: aktive agenter · forslag i dag · venter på godkjenning (lenke).
 *   - Registrerte agenter som kort-liste: navn, trigger, kjøringer, snitt-tid,
 *     status (Aktiv / Feil / Ingen data) — rad → /admin/agents/{slug}.
 *   - Manuell kjøring (KUN ADMIN): velg agent + kjør nå (server-action
 *     triggerAgentManually), med OK/feil-tilbakemelding.
 *   - Siste 30 kjøringer: agent · status · tid · når.
 *
 * Mobil: alt stables (kort-lister er allerede mobilvennlige — ingen bred tabell).
 * KPI-grid 2-kol → 3-kol på lg; agent/kjøringer-grid 1-kol → 3fr/2fr på lg.
 *
 * Ærlige tomrom: ingen fabrikerte tall — «Ingen data» der agenten mangler
 * kjøringer, TomTilstand ved 0 kjøringer.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  Knapp,
  FilterChips,
  InnsiktChip,
  TomTilstand,
  Icon,
  T,
} from "@/components/v2";
import { triggerAgentManually } from "@/app/admin/agents/actions";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export type AgentStatusKey = "aktiv" | "feil" | "ingen-data";

export interface AdminAgentV2Row {
  slug: string;
  navn: string;
  trigger: string;
  beskrivelse: string;
  status: AgentStatusKey;
  /** Antall kjøringer (OK + feil) i vinduet. */
  kjoringer: number;
  /** Snitt varighet i ms, eller null uten kjøringer. */
  snittTidMs: number | null;
  detaljHref: string;
}
export interface AdminAgentV2Run {
  id: string;
  agentName: string;
  ok: boolean;
  durationMs: number;
  naar: string;
}
export interface AdminAgenterV2Data {
  signalsCount: number;
  planActionsCount: number;
  aktiveAgenter: number;
  forslagIdag: number;
  pendingCount: number;
  godkjenningerHref: string;
  agenter: AdminAgentV2Row[];
  runs: AdminAgentV2Run[];
  /** Manuelt kjørbare agenter (ADMIN). Tom ⇒ ingen kjør-kort. */
  manuelleAgenter: { slug: string; navn: string }[];
  erAdmin: boolean;
}

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** Kvadratisk ikonflis (radens leading) — samme rytme som mockupens rad-ikoner. */
function IkonFlis({ name }: { name: string }) {
  return (
    <span
      style={{
        width: 34,
        height: 34,
        flex: "none",
        display: "grid",
        placeItems: "center",
        borderRadius: 10,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        color: T.fg2,
      }}
    >
      <Icon name={name} size={16} />
    </span>
  );
}

/** Status-indikator per agent — klarspråk, StatusPill for aktiv/feil, muted for tomt. */
function AgentStatus({ status }: { status: AgentStatusKey }) {
  if (status === "feil") return <StatusPill tone="down">Feil</StatusPill>;
  if (status === "aktiv") return <StatusPill tone="up">Aktiv</StatusPill>;
  return <Caps size={9}>Ingen data</Caps>;
}

/** Manuell kjøring (ADMIN) — velg agent via chips, kjør via server-action. */
function KjorAgent({ agenter }: { agenter: { slug: string; navn: string }[] }) {
  const [valgt, setValgt] = useState<string>(agenter[0]?.slug ?? "");
  const [pending, start] = useTransition();
  const [resultat, setResultat] = useState<{ ok: boolean; melding: string } | null>(null);

  const navnTilSlug = new Map(agenter.map((a) => [a.navn, a.slug]));
  const valgtNavn = agenter.find((a) => a.slug === valgt)?.navn ?? "";

  const kjor = () => {
    setResultat(null);
    start(async () => {
      const r = await triggerAgentManually(valgt);
      setResultat(r);
    });
  };

  return (
    <Kort eyebrow="Kjør agent manuelt" action={<Caps size={9}>Admin</Caps>}>
      <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginBottom: 12 }}>
        Kjør en agent umiddelbart i stedet for å vente på cron.
      </div>
      <FilterChips
        items={agenter.map((a) => a.navn)}
        active={[valgtNavn]}
        onToggle={(x) => {
          const s = navnTilSlug.get(x);
          if (s) setValgt(s);
        }}
      />
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
        <Knapp icon="play" disabled={pending || !valgt} onClick={kjor}>
          {pending ? "Kjører…" : "Kjør agent"}
        </Knapp>
        {resultat && (
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              fontWeight: 700,
              color: resultat.ok ? T.up : T.down,
            }}
          >
            {resultat.ok ? "OK" : "Feil"} · {resultat.melding}
          </span>
        )}
      </div>
    </Kort>
  );
}

export function AdminAgenterV2({ data }: { data: AdminAgenterV2Data }) {
  const router = useRouter();

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Agenter</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="pipeline.">Agent</Tittel>
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 8 }}>
          {pl(data.signalsCount, "signal", "signaler")} · {pl(data.planActionsCount, "plan-action", "plan-actions")} totalt.
        </div>
      </div>
      {data.pendingCount > 0 && (
        <div className="hidden md:block">
          <StatusPill tone="warn">
            {pl(data.pendingCount, "venter", "venter")}
          </StatusPill>
        </div>
      )}
    </div>
  );

  // ── KPI-flis (3) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Aktive agenter" value={data.aktiveAgenter} />
      <KpiFlis label="Forslag i dag" value={data.forslagIdag} />
      <Link href={data.godkjenningerHref} style={{ textDecoration: "none" }}>
        <KpiFlis label="Venter på godkjenning" value={data.pendingCount} varsle={data.pendingCount > 0} />
      </Link>
    </div>
  );

  // ── Registrerte agenter ───────────────────────────────────────
  const agentliste = (
    <Kort
      eyebrow="Registrerte agenter"
      action={<Caps size={9}>{pl(data.agenter.length, "agent", "agenter")}</Caps>}
      pad="4px 20px"
    >
      {data.agenter.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand icon="bot" title="Ingen agenter registrert" sub="Agentene dukker opp her når de er koblet på." />
        </div>
      ) : (
        data.agenter.map((a, i) => {
          const stats =
            a.kjoringer > 0
              ? `${pl(a.kjoringer, "kjøring", "kjøringer")}${a.snittTidMs != null ? ` · ${a.snittTidMs} ms snitt` : ""}`
              : "Ingen kjøringer ennå";
          return (
            <Rad
              key={a.slug}
              onClick={() => router.push(a.detaljHref)}
              leading={<IkonFlis name="bot" />}
              title={a.navn}
              sub={`${a.trigger} · ${stats}`}
              meta={<AgentStatus status={a.status} />}
              trailing={<Icon name="chevron-right" size={16} style={{ color: T.mut }} />}
              last={i === data.agenter.length - 1}
            />
          );
        })
      )}
    </Kort>
  );

  // ── Siste kjøringer ───────────────────────────────────────────
  const kjoringer = (
    <Kort
      eyebrow="Siste kjøringer"
      action={data.runs.length > 0 ? <Caps size={9}>{pl(data.runs.length, "siste", "siste")}</Caps> : undefined}
      pad="4px 20px"
    >
      {data.runs.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand
            icon="activity"
            title="Ingen kjøringer ennå"
            sub="Agentene kjøres automatisk ved nye signaler. Trigger manuelt for å teste."
          />
        </div>
      ) : (
        data.runs.map((r, i) => (
          <Rad
            key={r.id}
            leading={<StatusPill tone={r.ok ? "up" : "down"}>{r.ok ? "OK" : "Feil"}</StatusPill>}
            title={r.agentName}
            sub={r.naar}
            meta={
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.mut,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {r.durationMs} ms
              </span>
            }
            last={i === data.runs.length - 1}
          />
        ))
      )}
    </Kort>
  );

  // ── AI-innsikt → godkjenninger ────────────────────────────────
  const innsiktTekst =
    data.pendingCount > 0
      ? `${pl(data.pendingCount, "forslag venter", "forslag venter")} på godkjenning — behandle dem samlet.`
      : "Ingen forslag venter på godkjenning akkurat nå.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {data.erAdmin && data.manuelleAgenter.length > 0 && <KjorAgent agenter={data.manuelleAgenter} />}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {agentliste}
        {kjoringer}
      </div>
      <Link href={data.godkjenningerHref} style={{ textDecoration: "none" }}>
        <InnsiktChip cta="Se godkjenninger">{innsiktTekst}</InnsiktChip>
      </Link>
    </div>
  );
}
