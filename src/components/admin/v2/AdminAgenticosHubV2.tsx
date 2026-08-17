"use client";

/**
 * AgenticOS-hub — /admin/agenticos. Ny samleflate (Anders 2026-08-04,
 * `.claude/rules/beslutninger.md` §«AI-laget samles på ÉN adresse») som
 * erstatter spredningen over /admin/agents, /admin/agent-team og
 * AI-panelet på konsollen.
 *
 * Fasit: designsystem/paper/fase2/agencyos/agencyos-agenticos-hub.html.
 * Layout: hovedkolonne (KPI · agent-tabell · siste kjøringer · rom-lenker)
 * + fast høyrekolonne 380 px «Drift i tall» over 1180 px, som legger seg
 * under hovedinnholdet under 1180 px (samme brytepunkt som
 * SpillerProfilPanel/AgencyKalenderV2 — se `useErMobil` fra ArtefaktPanel).
 * Ingen modal/ark her: panelet er en passiv statistikkflate, ikke en
 * valg-drevet detalj, så det trenger ikke ArtefaktPanelets open/close.
 *
 * Fire tilstander:
 *  - Tom: ingen AgentRun i det hele tatt → CTA til en agent (fasitens
 *    data-vis="tom", eksklusiv med resten av innholdet).
 *  - Agentfeil: MINST ÉN agent har en feilet kjøring i 30-dagersvinduet →
 *    varsel-kort ØVERST i normal-tilstanden (ikke en egen eksklusiv skjerm
 *    — flere samtidige feil skal alle synes, og tabellen under skal
 *    fortsatt vise alle 13 agentene, ikke bare den som feiler).
 *  - Laster: dekkes av loading.tsx (V2Laster), ikke denne komponenten.
 *  - Normal: KPI + tabell + siste kjøringer + rom.
 */

import Link from "next/link";
import { AlertTriangle, ArrowRight, Bot } from "lucide-react";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, Rad, StatusPill, TomTilstand, Icon } from "@/components/v2";
import { useErMobil } from "@/components/portal/v2/chat/ArtefaktPanel";

export type AgentStatusKey = "aktiv" | "feil" | "ingen-data" | "manuell";

export interface AgenticosAgentRow {
  slug: string;
  navn: string;
  trigger: string;
  status: AgentStatusKey;
  kjoringer30d: number;
  snittTidMs: number | null;
  detaljHref: string;
}

export interface AgenticosRun {
  id: string;
  agentNavn: string;
  ok: boolean;
  durationMs: number;
  naar: string;
}

export interface AgenticosRom {
  navn: string;
  href: string;
  meta: string;
}

export interface AgenticosHubData {
  kpi: {
    registrerteAgenter: number;
    kjorbareManuelt: number;
    kjoringerSiste30: number;
    kjoringerOk: number;
    kjoringerFeil: number;
    forslagIdag: number;
    ventendeGodkjenning: number;
  };
  agenter: AgenticosAgentRow[];
  runs: AgenticosRun[];
  /** Agenter med minst én feilet kjøring i 30-dagersvinduet — varsel øverst. */
  feilendeAgenter: { navn: string; detaljHref: string }[];
  rom: AgenticosRom[];
  panel: {
    kjoringerIdag: number;
    kjoringerIdagFeil: number;
    feilrateTeller: number;
    feilrateNevner: number;
    snittTidMs: number | null;
    signaler7d: number;
    planForslag7d: number;
  };
  /** Fra ai_costs (datamodell vedtatt 13.08). null-kost = pris ukjent ved logging. */
  aiKost: {
    kallIdag: number;
    kostIdagUsd: number | null;
    kall7d: number;
    kost7dUsd: number | null;
    kallUtenPris7d: number;
  };
  godkjenningerHref: string;
}

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;
const usd = (belop: number | null) =>
  belop == null ? "—" : `$${belop.toFixed(2).replace(".", ",")}`;
const pst = (teller: number, nevner: number) =>
  nevner === 0 ? "—" : `${(100 * (teller / nevner)).toFixed(1).replace(".", ",")} %`;

function IkonFlis() {
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
      <Bot size={16} strokeWidth={1.5} />
    </span>
  );
}

/**
 * Fasitens `.kpi` (k/v/w — label/verdi/undertekst). `KpiCell` fra
 * `@/components/v2` har ingen sub-linje, og fasiten krever én under hver
 * verdi («11 kan kjøres manuelt», «28 OK · 2 feil» osv.) — derfor en egen,
 * lokal celle her (samme mønster som `SpillerProfilPanel`s `KpiCeller`).
 */
function KpiCell({
  label,
  value,
  sub,
  varsle,
}: {
  label: string;
  value: string | number;
  sub?: string;
  varsle?: boolean;
}) {
  return (
    <Kort tint={varsle} pad="16px">
      <Caps size={9}>{label}</Caps>
      <span
        style={{
          display: "block",
          fontFamily: T.mono,
          fontSize: "clamp(24px, 2.4vw, 28px)",
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
      {sub && (
        <span style={{ display: "block", fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 8 }}>{sub}</span>
      )}
    </Kort>
  );
}

function AgentStatus({ status }: { status: AgentStatusKey }) {
  if (status === "feil") return <StatusPill tone="down">Feil</StatusPill>;
  if (status === "aktiv") return <StatusPill tone="up">Aktiv</StatusPill>;
  if (status === "manuell") return <Caps size={9}>Manuell</Caps>;
  return <Caps size={9}>Ingen data</Caps>;
}

/** Fasitens `.varsel` — dn-kant, aldri clay. Kan liste flere feilende agenter samtidig. */
function AgentfeilVarsel({ feilende }: { feilende: { navn: string; detaljHref: string }[] }) {
  if (feilende.length === 0) return null;
  return (
    <Kort
      style={{ borderColor: T.down, boxShadow: `inset 3px 0 0 ${T.down}` }}
      eyebrow={feilende.length === 1 ? "1 agent feiler" : `${feilende.length} agenter feiler`}
      action={<AlertTriangle size={16} color={T.down} strokeWidth={1.5} />}
    >
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "0 0 10px" }}>
        Minst én kjøring har feilet i de siste 30 dagene. Godkjente forslag fra tidligere kjøringer
        står fortsatt i køen — ingenting er rørt uten deg.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {feilende.map((a) => (
          <Link
            key={a.detaljHref}
            href={a.detaljHref}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.fg,
              textDecoration: "none",
            }}
          >
            <StatusPill tone="down">Feil</StatusPill>
            {a.navn}
            <ArrowRight size={13} style={{ marginLeft: "auto", color: T.mut }} />
          </Link>
        ))}
      </div>
    </Kort>
  );
}

function DriftPanel({ data }: { data: AgenticosHubData }) {
  return (
    <aside aria-label="Drift i tall" style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <Kort eyebrow="Drift i tall" pad="16px">
        <div className="grid grid-cols-2" style={{ gap: 10 }}>
          <KpiCell label="Kjøringer i dag" value={data.panel.kjoringerIdag} />
          <KpiCell
            label="Feilrate 30 d"
            value={pst(data.panel.feilrateTeller, data.panel.feilrateNevner)}
            sub={`${data.panel.feilrateTeller} av ${data.panel.feilrateNevner}`}
            varsle={data.panel.feilrateTeller > 0}
          />
          <KpiCell
            label="Snitt-tid"
            value={data.panel.snittTidMs != null ? `${(data.panel.snittTidMs / 1000).toFixed(1).replace(".", ",")} s` : "—"}
            sub="alle agenter"
          />
          <KpiCell label="Signaler 7 d" value={data.panel.signaler7d} sub={`${data.panel.planForslag7d} plan-forslag`} />
        </div>
      </Kort>

      <Kort eyebrow="AI-kost" pad="16px">
        {data.aiKost.kall7d === 0 ? (
          <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: 0, lineHeight: 1.6 }}>
            Ingen kostdata siste 7 dager. Tabellene er på plass — agentene logger kall via{" "}
            <code style={{ fontFamily: T.mono, fontSize: 11, background: T.panel2, padding: "1px 4px", borderRadius: 4 }}>
              registrerAiKost
            </code>{" "}
            etter hvert som de kobles på.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2" style={{ gap: 10 }}>
              <KpiCell label="Kost i dag" value={usd(data.aiKost.kostIdagUsd)} sub={pl(data.aiKost.kallIdag, "kall", "kall")} />
              <KpiCell label="Kost 7 d" value={usd(data.aiKost.kost7dUsd)} sub={pl(data.aiKost.kall7d, "kall", "kall")} />
            </div>
            {data.aiKost.kallUtenPris7d > 0 && (
              <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, margin: "8px 0 0", lineHeight: 1.5 }}>
                {pl(data.aiKost.kallUtenPris7d, "kall mangler pris", "kall mangler pris")} — modellen er
                ikke i katalogen, kosten er ikke medregnet.
              </p>
            )}
          </>
        )}
      </Kort>

      <Kort eyebrow="Ruter som samles her" pad="4px 16px">
        <Rad title="/admin/agents" meta={<Caps size={9}>→ hit</Caps>} last={false} />
        <Rad title="/admin/agent-team" meta={<Caps size={9}>→ hit</Caps>} last={false} />
        <Rad title="/kommando/*" meta={<Caps size={9}>4 stubber ut</Caps>} last={false} />
        <Rad title="/meg/dispatch + morgenbrief" meta={<Caps size={9}>→ brief</Caps>} last />
      </Kort>

      <Link href={data.godkjenningerHref} style={{ textDecoration: "none" }}>
        <Kort pad="14px 16px" hover>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>Åpne godkjenningskøen</span>
            <ArrowRight size={16} style={{ color: T.mut }} />
          </div>
        </Kort>
      </Link>
    </aside>
  );
}

export function AdminAgenticosHubV2({ data }: { data: AgenticosHubData }) {
  const smal = useErMobil(1180);

  // ── Tom-tilstand: ingen kjøringer i det hele tatt ──────────────
  if (data.runs.length === 0 && data.agenter.every((a) => a.status === "ingen-data")) {
    return (
      <div data-paper-slug="agencyos-agenticos-hub" style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 640, margin: "0 auto" }}>
        <div>
          <Caps>AgencyOS · AgenticOS</Caps>
          <div style={{ marginTop: 8 }}>
            <Tittel>AgenticOS</Tittel>
          </div>
        </div>
        <Kort>
          <TomTilstand
            icon="bot"
            title="Ingen kjøringer ennå"
            sub="Agentene kjører på cron og etter spilleraktivitet. Den første kjøringen dukker opp her — eller kjør en av de manuelle agentene fra lista."
          />
          {data.agenter.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <Link href={data.agenter[0].detaljHref} style={{ textDecoration: "none" }}>
                <Kort hover pad="12px 16px">
                  <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>Åpne en agent →</span>
                </Kort>
              </Link>
            </div>
          )}
        </Kort>
      </div>
    );
  }

  const hode = (
    <div>
      <Caps>AgencyOS · AgenticOS</Caps>
      <div style={{ marginTop: 8 }}>
        <Tittel>AgenticOS</Tittel>
      </div>
      <p style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 4 }}>
        agencyos · drift · nås fra «Mer» og ⌘K
      </p>
    </div>
  );

  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiCell
        label="Registrerte agenter"
        value={data.kpi.registrerteAgenter}
        sub={`${pl(data.kpi.kjorbareManuelt, "kan kjøres manuelt", "kan kjøres manuelt")}`}
      />
      <KpiCell
        label="Kjøringer siste 30"
        value={data.kpi.kjoringerSiste30}
        sub={`${data.kpi.kjoringerOk} OK · ${data.kpi.kjoringerFeil} feil`}
      />
      <KpiCell label="Forslag i dag" value={data.kpi.forslagIdag} sub="skrevet til PlanAction" />
      <Link href={data.godkjenningerHref} style={{ textDecoration: "none" }}>
        <KpiCell
          label="Venter på deg"
          value={data.kpi.ventendeGodkjenning}
          sub="i godkjenningskøen →"
          varsle={data.kpi.ventendeGodkjenning > 0}
        />
      </Link>
    </div>
  );

  // Rad har onClick men vi vil ha ekte lenker (href) for a11y/åpne-i-ny-fane —
  // wrap i Link i stedet for å bruke Rads onClick+router.push.
  const agentTabellMedLenker = (
    <Kort eyebrow="Agenter" action={<Caps size={9}>{pl(data.agenter.length, "registrert", "registrert")}</Caps>} pad="4px 20px">
      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "10px 0" }}>
        Statusen regnes fra de siste 30 kjøringene: feil betyr minst én feilet kjøring i vinduet, ikke
        at agenten er nede.
      </p>
      {data.agenter.map((a, i) => {
        const stats =
          a.kjoringer30d > 0
            ? `${pl(a.kjoringer30d, "kjøring", "kjøringer")}${
                a.snittTidMs != null ? ` · ${(a.snittTidMs / 1000).toFixed(1).replace(".", ",")} s snitt` : ""
              }`
            : "Ingen kjøringer i vinduet";
        return (
          <Link key={a.slug} href={a.detaljHref} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad
              leading={<IkonFlis />}
              title={a.navn}
              sub={`${a.trigger} · ${stats}`}
              meta={<AgentStatus status={a.status} />}
              trailing={<Icon name="chevron-right" size={16} style={{ color: T.mut }} />}
              last={i === data.agenter.length - 1}
            />
          </Link>
        );
      })}
    </Kort>
  );

  const sisteKjoringer = (
    <Kort eyebrow="Siste kjøringer" action={<Caps size={9}>{pl(data.runs.length, "i vinduet", "i vinduet")}</Caps>} pad="4px 20px">
      {data.runs.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand icon="activity" title="Ingen kjøringer" sub="Ingen kjøringer i vinduet ennå." />
        </div>
      ) : (
        data.runs.map((r, i) => (
          <Rad
            key={r.id}
            leading={<StatusPill tone={r.ok ? "up" : "down"}>{r.ok ? "OK" : "Feil"}</StatusPill>}
            title={r.agentNavn}
            sub={r.naar}
            meta={
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
                {(r.durationMs / 1000).toFixed(1).replace(".", ",")}&nbsp;s
              </span>
            }
            last={i === data.runs.length - 1}
          />
        ))
      )}
    </Kort>
  );

  const rom = (
    <Kort eyebrow="Verktøy og rom" pad="4px 20px">
      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "10px 0" }}>
        Egne ruter som hører til drift — samleflaten er inngangen, ikke erstatningen.
      </p>
      {data.rom.map((r, i) => (
        <Link key={r.href} href={r.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad title={r.navn} sub={r.meta} trailing={<Icon name="chevron-right" size={16} style={{ color: T.mut }} />} last={i === data.rom.length - 1} />
        </Link>
      ))}
    </Kort>
  );

  const hovedinnhold = (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
      {hode}
      <AgentfeilVarsel feilende={data.feilendeAgenter} />
      {kpi}
      {agentTabellMedLenker}
      {sisteKjoringer}
      {rom}
    </div>
  );

  if (smal) {
    return (
      <div data-paper-slug="agencyos-agenticos-hub" style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hovedinnhold}
        <DriftPanel data={data} />
      </div>
    );
  }

  return (
    <div
      data-paper-slug="agencyos-agenticos-hub"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 380px",
        gap: T.gap,
        alignItems: "start",
        minWidth: 0,
      }}
    >
      {hovedinnhold}
      <div style={{ minWidth: 0, position: "sticky", top: 16 }}>
        <DriftPanel data={data} />
      </div>
    </div>
  );
}
