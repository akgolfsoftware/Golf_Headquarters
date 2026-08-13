"use client";

/**
 * Agent-detalj — /admin/agents/[agentId]. Én mal for cron-, hendelses- og
 * manuelle agenter (fasitens fire tilstander: Aktiv · Feilet · Manuell ·
 * Ingen data).
 *
 * Fasit: designsystem/paper/fase2/agencyos/agencyos-agent-detalj.html.
 * Layout: hovedkolonne + fast høyrekolonne 380 px «Agenten i tall» over
 * 1180 px (samme brytepunkt som AdminAgenticosHubV2/SpillerProfilPanel —
 * se `useErMobil` fra ArtefaktPanel), som legger seg under hovedinnholdet
 * under 1180 px. Panelet ligger UTENFOR de fire tilstandene i fasiten
 * (alltid synlig), så det rendres likt for alle fire her også.
 *
 * «Siste kjøring i detalj» viser steg fra KommandoAgentStep når kjøringen
 * er en agent-team-kjøring (flere modeller); ingen av de 13 registrerte
 * agentene skriver slike steg i dag (AgentRun har ingen kobling til
 * KommandoAgentRun i schema), så seksjonen faller ærlig tilbake til ett
 * steg utledet av selve AgentRun-raden — akkurat som fasitens egen tekst
 * sier («en enkel agent har ett steg»).
 *
 * «Kjør nå»/«Kjør på nytt» for cron-/hendelsesagenter er bevisst deaktivert
 * med forklaring: det finnes ingen bruker-trigget kjøre-mekanisme for dem i
 * dag — /api/cron/[agent] er CRON_SECRET-beskyttet og kun ment for Vercel
 * Cron. Manuelle agenter (plan-revisjon/peaking) har ekte kjøre-mekanismer
 * (AgentRunPanel + run-actions.ts) og gjenbrukes uendret.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, KpiFlis, StatusPill, MikroMeta, TomTilstand, Rad, Knapp, Icon } from "@/components/v2";
import { useErMobil } from "@/components/portal/v2/chat/ArtefaktPanel";
import { AgentRunPanel } from "@/app/admin/agents/[agentId]/agent-run-panel";
import { ApprovalActions } from "@/app/admin/(legacy)/approvals/approval-actions";

export type AgentDetaljTilstand = "aktiv" | "feilet" | "manuell" | "ingen";
export type AgentDetaljStatusBadge = "aktiv" | "beta" | "planlagt";

export interface AgentDetaljSteg {
  rolle: string;
  tekst: string;
  ok: boolean;
}

export interface AgentDetaljKjoring {
  id: string;
  naar: string;
  varighetTekst: string;
  ok: boolean;
  outputTekst: string | null;
}

export interface AgentDetaljForslag {
  id: string;
  actionTypeLabel: string;
  statusLabel: string;
  tone: "warn" | "up" | "info";
  brukerNavn: string;
  playerId: string;
  naar: string;
  forklaring: string | null;
  pending: boolean;
}

export interface AgentDetaljValg {
  id: string;
  label: string;
}

export interface AgentDetaljData {
  agentId: string;
  navn: string;
  beskrivelse: string;
  trigger: string;
  statusBadge: AgentDetaljStatusBadge;
  tilstand: AgentDetaljTilstand;
  agentDetaljHref: string;
  godkjenningerHref: string;
  feilloggHref: string;
  kpi: {
    kjoringer30d: number;
    kjoringerSub: string;
    snittTidTekst: string;
    forslagLaget: number;
    forslagSub: string;
  };
  kjoringer: AgentDetaljKjoring[];
  kjoringerVindusTekst: string;
  sisteSteg: { naarTekst: string; steg: AgentDetaljSteg[] } | null;
  forslag: AgentDetaljForslag[];
  panel: {
    godkjentRateTekst: string;
    godkjentSub: string;
    eldsteIKoTekst: string;
    eldsteSub: string;
  };
  feil: { naarTekst: string; sidenTekst: string; melding: string | null } | null;
  manuell: {
    plans: AgentDetaljValg[];
    players: AgentDetaljValg[];
    tournaments: AgentDetaljValg[];
  } | null;
}

const STATUS_TONE: Record<AgentDetaljStatusBadge, "up" | "warn" | "info"> = {
  aktiv: "up",
  beta: "warn",
  planlagt: "info",
};

/** Fasitens `.kpi` (k/v/w — label/verdi/undertekst). Samme lokale mønster
 * som AdminAgenticosHubV2s KpiCell — KpiFlis fra `@/components/v2` har ingen
 * sub-linje, og fasiten krever én under hver verdi. */
function KpiCell({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Kort pad="16px">
      <Caps size={9}>{label}</Caps>
      <span
        style={{
          display: "block",
          fontFamily: T.mono,
          fontSize: "clamp(22px, 2.2vw, 26px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: T.fg,
          lineHeight: 1,
          marginTop: 12,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      {sub && <span style={{ display: "block", fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 8 }}>{sub}</span>}
    </Kort>
  );
}

function StegLinje({ steg, last }: { steg: AgentDetaljSteg; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
      }}
    >
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: T.mut,
          minWidth: 88,
          flex: "none",
          paddingTop: 1,
        }}
      >
        {steg.rolle}
      </span>
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg, lineHeight: 1.5, flex: 1, minWidth: 0 }}>
        {steg.tekst}
      </span>
      <StatusPill tone={steg.ok ? "up" : "down"}>{steg.ok ? "OK" : "Feil"}</StatusPill>
    </div>
  );
}

function DeaktivertKjorKnapp({ forklaring }: { forklaring: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      <Knapp icon="play" disabled>
        Kjør nå
      </Knapp>
      <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, maxWidth: "48ch" }}>{forklaring}</span>
    </div>
  );
}

function InspektorPanel({ data }: { data: AgentDetaljData }) {
  return (
    <aside aria-label="Agenten i tall" style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <Kort eyebrow="Agenten i tall" pad="16px">
        <div className="grid grid-cols-2" style={{ gap: 10 }}>
          <KpiFlis label="Godkjent-rate" value={data.panel.godkjentRateTekst} />
          <KpiFlis label="Eldste i kø" value={data.panel.eldsteIKoTekst} />
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, margin: "10px 0 0" }}>
          {data.panel.godkjentSub} · {data.panel.eldsteSub}
        </p>
      </Kort>

      <Kort eyebrow="Skriver til" pad="4px 16px">
        <Rad title="PlanAction" meta={<Caps size={9}>forslag</Caps>} trailing={null} last={false} />
        <Rad title="Signal" meta={<Caps size={9}>beregninger</Caps>} trailing={null} last={false} />
        <Rad title="AgentRun" meta={<Caps size={9}>logg</Caps>} trailing={null} last />
      </Kort>

      <Kort eyebrow="Slik leses statusen" pad="14px 16px">
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: 0, lineHeight: 1.6 }}>
          «Feil» betyr at en kjøring stoppet — aldri at noe ble endret uten deg. En agent kan ikke
          endre en plan; den kan bare foreslå.
        </p>
      </Kort>

      <Link href={data.godkjenningerHref} style={{ textDecoration: "none" }}>
        <Kort pad="14px 16px" hover>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>Forslagene i køen</span>
            <Icon name="arrow-right" size={16} style={{ color: T.mut }} />
          </div>
        </Kort>
      </Link>
    </aside>
  );
}

function ForslagListe({ forslag, godkjenningerHref }: { forslag: AgentDetaljForslag[]; godkjenningerHref: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <MikroMeta icon="sparkles">Siste forslag fra agenten</MikroMeta>
        <Link href={godkjenningerHref} style={{ textDecoration: "none" }}>
          <MikroMeta icon="arrow-right">Se alle ventende</MikroMeta>
        </Link>
      </div>

      {forslag.length === 0 ? (
        <Kort>
          <TomTilstand icon="sparkles" title="Ingen forslag ennå" sub="Forslag fra denne agenten dukker opp her." />
        </Kort>
      ) : (
        forslag.map((a) => (
          <Kort key={a.id} pad="14px 18px">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Caps size={9}>{a.actionTypeLabel}</Caps>
                  <StatusPill tone={a.tone}>{a.statusLabel}</StatusPill>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{a.brukerNavn}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginLeft: "auto" }}>{a.naar}</span>
                </div>
                {a.forklaring && (
                  <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.6, margin: 0 }}>{a.forklaring}</p>
                )}
              </div>
              {a.pending && (
                <div style={{ flexShrink: 0 }}>
                  <ApprovalActions actionId={a.id} playerId={a.playerId} />
                </div>
              )}
            </div>
          </Kort>
        ))
      )}
    </div>
  );
}

function KjoringerTabell({ data }: { data: AgentDetaljData }) {
  return (
    <Kort eyebrow="Kjøringer" action={<Caps size={9}>{data.kjoringerVindusTekst}</Caps>} pad="4px 18px">
      {data.kjoringer.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand icon="activity" title="Ingen kjøringer" sub="Ingen kjøringer i vinduet ennå." />
        </div>
      ) : (
        data.kjoringer.map((k, i) => (
          <Rad
            key={k.id}
            leading={<StatusPill tone={k.ok ? "up" : "down"}>{k.ok ? "OK" : "Feil"}</StatusPill>}
            title={k.naar}
            sub={k.outputTekst ?? undefined}
            meta={
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
                {k.varighetTekst}
              </span>
            }
            trailing={null}
            last={i === data.kjoringer.length - 1}
          />
        ))
      )}
    </Kort>
  );
}

function SisteKjoringIDetalj({ steg }: { steg: { naarTekst: string; steg: AgentDetaljSteg[] } | null }) {
  if (!steg) return null;
  return (
    <Kort eyebrow="Siste kjøring i detalj" action={<Caps size={9}>{steg.naarTekst}</Caps>} pad="4px 18px 12px">
      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "10px 0" }}>
        Stegene vises for agent-team-kjøringer med flere modeller; en enkel agent har ett steg.
      </p>
      <div style={{ borderTop: `1px solid ${T.border}` }}>
        {steg.steg.map((s, i) => (
          <StegLinje key={i} steg={s} last={i === steg.steg.length - 1} />
        ))}
      </div>
    </Kort>
  );
}

function HodeOgKpi({ data }: { data: AgentDetaljData }) {
  return (
    <>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Caps>AgencyOS · Agenter</Caps>
          <StatusPill tone={STATUS_TONE[data.statusBadge]}>{data.statusBadge}</StatusPill>
        </div>
        <div style={{ marginTop: 10 }}>
          <Tittel>{data.navn}</Tittel>
        </div>
        <p style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 4 }}>
          agenticos · agent-detalj · {data.trigger.toLowerCase()}
        </p>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0", maxWidth: "62ch" }}>
          {data.beskrivelse}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4" style={{ gap: T.gap }}>
        <KpiCell label="Kjøringer 30 d" value={data.kpi.kjoringer30d} sub={data.kpi.kjoringerSub} />
        <KpiCell label="Snitt-tid" value={data.kpi.snittTidTekst} sub="siste kjøringer" />
        <KpiCell label="Forslag laget" value={data.kpi.forslagLaget} sub={data.kpi.forslagSub} />
        <KpiCell label="Trigger" value={data.trigger} />
      </div>
    </>
  );
}

function AktivSeksjon({ data }: { data: AgentDetaljData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <HodeOgKpi data={data} />
      <Kort eyebrow="Om agenten" action={<StatusPill tone="up">Aktiv</StatusPill>}>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.6 }}>{data.beskrivelse}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <DeaktivertKjorKnapp forklaring="Cron-/hendelsesagenter kan ikke trigges fra AgencyOS ennå — de kjører kun på plan eller hendelse." />
          <Link href={data.godkjenningerHref} style={{ textDecoration: "none" }}>
            <Knapp icon="arrow-right" style={{ background: "transparent", border: `1px solid ${T.borderS}`, color: T.fg }}>
              Forslagene i køen
            </Knapp>
          </Link>
        </div>
      </Kort>
      <KjoringerTabell data={data} />
      <SisteKjoringIDetalj steg={data.sisteSteg} />
      <ForslagListe forslag={data.forslag} godkjenningerHref={data.godkjenningerHref} />
    </div>
  );
}

function FeiletSeksjon({ data }: { data: AgentDetaljData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <HodeOgKpi data={data} />
      <Kort style={{ borderColor: T.down, boxShadow: `inset 3px 0 0 ${T.down}` }} eyebrow="Siste kjøring feilet" action={<AlertTriangle size={16} color={T.down} strokeWidth={1.5} />}>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "0 0 8px", lineHeight: 1.6 }}>
          {data.feil?.naarTekst}
          {data.feil?.sidenTekst ? ` — ${data.feil.sidenTekst}` : ""}
        </p>
        {data.feil?.melding && (
          <p style={{ fontFamily: T.mono, fontSize: 11.5, color: T.down, margin: "0 0 12px" }}>{data.feil.melding}</p>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <DeaktivertKjorKnapp forklaring="Ingen manuell gjenkjøring ennå — retten skjer på neste plan eller hendelse." />
          <Link href={data.feilloggHref} style={{ textDecoration: "none" }}>
            <Knapp icon="external-link" style={{ background: "transparent", border: `1px solid ${T.borderS}`, color: T.fg }}>
              Åpne feilloggen
            </Knapp>
          </Link>
        </div>
      </Kort>
      <KjoringerTabell data={data} />
      <SisteKjoringIDetalj steg={data.sisteSteg} />
      <ForslagListe forslag={data.forslag} godkjenningerHref={data.godkjenningerHref} />
    </div>
  );
}

function ManuellSeksjon({ data }: { data: AgentDetaljData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <HodeOgKpi data={data} />
      <Kort eyebrow={data.navn} action={<Caps size={9}>Manuell</Caps>}>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "0 0 14px", lineHeight: 1.6 }}>
          {data.beskrivelse}
        </p>
        <AgentRunPanel
          agentId={data.agentId}
          plans={data.manuell?.plans}
          players={data.manuell?.players}
          tournaments={data.manuell?.tournaments}
        />
      </Kort>
      {data.kjoringer.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="bot"
            title="Ingen kjøringer ennå"
            sub="Manuelle agenter kjører bare når du ber om det. Den første kjøringen og stegene dens dukker opp her."
          />
        </Kort>
      ) : (
        <>
          <KjoringerTabell data={data} />
          <SisteKjoringIDetalj steg={data.sisteSteg} />
        </>
      )}
      <ForslagListe forslag={data.forslag} godkjenningerHref={data.godkjenningerHref} />
    </div>
  );
}

function IngenSeksjon({ data }: { data: AgentDetaljData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <HodeOgKpi data={data} />
      <Kort>
        <TomTilstand
          icon="bot"
          title="Ingen kjøringer siste 30 dager"
          sub="Agenten er registrert, men utløseren har ikke truffet ennå. Den kjører etter neste hendelse eller cron."
        />
        <div style={{ marginTop: 14 }}>
          <DeaktivertKjorKnapp forklaring="Ingen manuell trigger for denne agenten ennå — den kjører på plan eller hendelse." />
        </div>
      </Kort>
      <ForslagListe forslag={data.forslag} godkjenningerHref={data.godkjenningerHref} />
    </div>
  );
}

function Innhold({ data }: { data: AgentDetaljData }): ReactNode {
  if (data.tilstand === "feilet") return <FeiletSeksjon data={data} />;
  if (data.tilstand === "manuell") return <ManuellSeksjon data={data} />;
  if (data.tilstand === "ingen") return <IngenSeksjon data={data} />;
  return <AktivSeksjon data={data} />;
}

export function AdminAgentDetaljV2({ data }: { data: AgentDetaljData }) {
  const smal = useErMobil(1180);

  const topp = (
    <Link href={data.agentDetaljHref} style={{ textDecoration: "none", alignSelf: "flex-start" }}>
      <MikroMeta icon="arrow-left">Agenter</MikroMeta>
    </Link>
  );

  if (smal) {
    return (
      <div data-paper-slug="agencyos-agent-detalj" style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {topp}
        <Innhold data={data} />
        <InspektorPanel data={data} />
      </div>
    );
  }

  return (
    <div data-paper-slug="agencyos-agent-detalj" style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
      {topp}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: T.gap, alignItems: "start", minWidth: 0 }}>
        <Innhold data={data} />
        <div style={{ minWidth: 0, position: "sticky", top: 16 }}>
          <InspektorPanel data={data} />
        </div>
      </div>
    </div>
  );
}
