/**
 * AgencyOS — Daglig AI-brief (/admin/brief)
 * Coachens morgenbrief: AI-oppsummering + dagens nøkkeltall + agentenes forslag.
 *
 * Restylet til athletic operations-tetthet (matcher daily-brief.tsx):
 *   - Mono-caps eyebrow + LIVE-indikator + Inter Tight-hero
 *   - KPI-strip med ikoner og DS-tokens
 *   - AI-brief i forest-tonet kort + AgentStrip-hint
 *   - Seksjon 03 «Agentenes anbefalinger» nå koblet til ekte PlanAction-rader
 *     (tidligere statisk placeholder) · seksjon 04 «Krever oppmerksomhet»
 *
 * AI-genereringen (Anthropic) og getBriefData beholdt 1:1. Ekte Prisma.
 * Ingen hardkodet hex, ingen emoji (kun lucide-react).
 */

import Link from "next/link";
import {
  Activity,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Inbox,
  Mail,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";
import { FokusSpillerPanel, type FokusSpillerData } from "./_fokus-spiller";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/shared/print-button";
import { EksportTrigger } from "@/components/shared/eksport-trigger";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import { AthleticEyebrow } from "@/components/athletic";
import { cn } from "@/lib/utils";
import {
  getBriefData,
  bygBriefSystemPrompt,
  bygBriefUserPrompt,
} from "@/lib/admin-brief";
import { anthropicKlient, COACH_MODEL } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
};

export default async function DagligBrief() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await getBriefData(coach);

  // Ekte agent-forslag (siste 7 dager) — driver seksjon 03 i stedet for statisk tekst.
  const enUkeSiden = new Date();
  enUkeSiden.setDate(enUkeSiden.getDate() - 7);
  const ferskeForslag = await prisma.planAction.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const suggSchema = z.object({ forklaring: z.string() }).partial().nullable();
  const seenUserIds = new Set<string>();
  const fokusSpillere: FokusSpillerData[] = [];
  for (const a of ferskeForslag) {
    if (seenUserIds.has(a.user.id)) continue;
    seenUserIds.add(a.user.id);
    const name = a.user.name ?? "Ukjent spiller";
    const parts = name.split(" ").filter(Boolean);
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts.at(-1)![0]).toUpperCase()
        : (parts[0]?.[0] ?? "?").toUpperCase();
    const isEscalation = a.actionType === "ESCALATION";
    const isWarn = ["TAPER_ENGAGE", "WITHDRAW", "DELOAD"].includes(a.actionType);
    const parsed = suggSchema.safeParse(a.suggestion);
    const forklaring = parsed.success ? parsed.data?.forklaring : undefined;
    fokusSpillere.push({
      id: a.user.id,
      name,
      initials,
      tone: "neu" as const,
      meta: ACTION_LABEL[a.actionType] ?? a.actionType,
      signal: isEscalation ? "Haster" : isWarn ? "Plan-justering" : "Forslag venter",
      signalType: isEscalation ? "alert" : isWarn ? "warn" : "info",
      reason:
        forklaring ??
        `${ACTION_LABEL[a.actionType] ?? a.actionType} — foreslått av ${a.agentName}`,
    });
  }

  let aiBrief: string | null = null;
  let aiFeil: string | null = null;
  try {
    const klient = anthropicKlient();
    const respons = await klient.messages.create({
      model: COACH_MODEL,
      max_tokens: 400,
      system: bygBriefSystemPrompt(),
      messages: [{ role: "user", content: bygBriefUserPrompt(data) }],
    });
    aiBrief = respons.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
  } catch (err) {
    aiFeil = err instanceof Error ? err.message : "AI-brief utilgjengelig.";
  }

  const idag = new Date();
  const eyebrowDato = idag
    .toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
  const ukeNr = (() => {
    const d = new Date(
      Date.UTC(idag.getFullYear(), idag.getMonth(), idag.getDate()),
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  })();
  const klokke = idag.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const startTid = data.dagensTimer.start?.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sluttTid = data.dagensTimer.slutt?.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8">
      {/* Hero */}
      <header className="mb-5 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <AthleticEyebrow>{`${eyebrowDato} · UKE ${ukeNr}`}</AthleticEyebrow>
          <h1 className="mt-1.5 font-display text-3xl font-bold leading-tight tracking-tight md:text-[34px]">
            {idag
              .toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
              .replace(/^\w/, (c) => c.toUpperCase())}
            .{" "}
            <em
              className="font-normal italic text-primary"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              {data.dagensTimer.antall === 0
                ? "Ingen økter i dag."
                : `${data.dagensTimer.antall} ${data.dagensTimer.antall === 1 ? "økt" : "økter"} planlagt.`}
            </em>
          </h1>
          <p className="mt-2 inline-flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
              LIVE
            </span>
            Brief generert {klokke} · genereres på nytt ved hvert besøk
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrintButton
            label="Skriv ut"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          />
          <EksportTrigger kind="brief" />
          <Link
            href="/admin/settings"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Innstillinger
          </Link>
          <button
            type="button"
            disabled
            title="E-postutsending kommer i v2"
            className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-medium text-primary-foreground opacity-50"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Send som e-post
          </button>
        </div>
      </header>

      {/* AI-agent hint */}
      <div className="mb-5">
        <AgentStrip label="AK-AGENT · DAGLIG BRIEF">
          {data.dagensTimer.antall === 0
            ? "Ingen økter i dag — bruk dagen til plan-revisjon og godkjenningskøen."
            : `Du har ${data.dagensTimer.antall} ${data.dagensTimer.antall === 1 ? "økt" : "økter"} planlagt fra ${startTid} til ${sluttTid}. ${data.ventendeGodkjenninger > 0 ? `${data.ventendeGodkjenninger} agent-forslag venter på godkjenning.` : "Godkjenningskøen er tom."}`}
        </AgentStrip>
      </div>

      {/* KPI-strip */}
      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="DAGENS ØKTER"
          value={data.dagensTimer.antall}
          icon={CalendarClock}
          foot={
            data.dagensTimer.antall === 0
              ? "Ingen bookinger"
              : `${startTid}–${sluttTid}`
          }
        />
        <Kpi
          label="VENTENDE GODKJENNINGER"
          value={data.ventendeGodkjenninger}
          icon={ClipboardCheck}
          tone={data.ventendeGodkjenninger > 0 ? "accent" : undefined}
          foot={
            data.ventendeGodkjenninger > 0 ? undefined : "Alt avklart"
          }
          footLink={
            data.ventendeGodkjenninger > 0
              ? { text: "venter på godkjenning →", href: "/admin/approvals" }
              : undefined
          }
        />
        <Kpi
          label="UBESVARTE MELDINGER"
          value={data.ubesvarteMeldinger}
          icon={Inbox}
          foot={
            data.ubesvarteMeldinger === 0 ? "Innboks ryddig" : "direkte-meldinger"
          }
          footLink={
            data.ubesvarteMeldinger > 0
              ? { text: "åpne innboks →", href: "/admin/messages" }
              : undefined
          }
        />
        <Kpi
          label="AGENT-OUTPUT · 7D"
          value={data.ukenGenerert.signals}
          icon={Activity}
          foot={`${data.ukenGenerert.planActions} plan-forslag`}
        />
      </section>

      {/* 01 — AI-brief */}
      <section className="mb-8">
        <SectionNum num="01" title="AI-brief · oppsummering av dagen" />
        <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-6 sm:p-8">
          {aiBrief ? (
            <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-foreground">
              {aiBrief}
            </pre>
          ) : (
            <p className="text-[13.5px] text-muted-foreground">
              {aiFeil
                ? `Kunne ikke generere AI-brief: ${aiFeil}`
                : "Genererer brief…"}
            </p>
          )}
        </div>
      </section>

      {/* 02 — Nyligste runder */}
      <section className="mb-8">
        <SectionNum num="02" title={`Nyligste runder · ${data.nyligeRunder.length}`} />
        {data.nyligeRunder.length === 0 ? (
          <EmptyRow
            icon={Activity}
            title="Ingen runder siste 24 timer"
            meta="Når spillere registrerer runder dukker de opp her."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <Th>Spiller</Th>
                    <Th>Bane</Th>
                    <Th right>SG-tot</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[13px]">
                  {data.nyligeRunder.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {r.spiller}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{r.bane}</td>
                      <td
                        className={cn(
                          "px-4 py-3.5 text-right font-mono tabular-nums",
                          r.sgTotal != null && r.sgTotal >= 0
                            ? "text-primary"
                            : r.sgTotal != null
                              ? "text-destructive"
                              : "text-muted-foreground",
                        )}
                      >
                        {r.sgTotal != null
                          ? `${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1).replace(".", ",")}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 03 + 04 — agentenes anbefalinger + oppmerksomhet */}
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div>
          <SectionNum num="03" title="Agentenes anbefalinger" />
          <div className="flex flex-col gap-2.5">
            <Rec
              icon={Bot}
              tone="primary"
              title="Agent-pipeline aktiv"
              desc={`${data.ukenGenerert.signals} signaler beregnet og ${data.ukenGenerert.planActions} plan-forslag laget siste 7 dager.`}
            />
            {ferskeForslag.length === 0 ? (
              <Rec
                icon={CheckCircle2}
                tone="muted"
                title="Ingen forslag venter"
                desc="Forslag kommer typisk etter mandag-cron eller etter ny spilleraktivitet."
              />
            ) : (
              ferskeForslag.map((a) => {
                const sugg = a.suggestion as { forklaring?: string } | null;
                return (
                  <Link
                    key={a.id}
                    href={`/admin/spillere/${a.user.id}`}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-primary">
                      <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-semibold text-foreground group-hover:text-primary">
                          {a.user.name}
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                          {ACTION_LABEL[a.actionType] ?? a.actionType}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                        {sugg?.forklaring ?? a.agentName}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          {data.ventendeGodkjenninger > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">
                {data.ventendeGodkjenninger} forslag venter totalt
              </span>
              <Link
                href="/admin/approvals"
                className="text-[13px] font-medium text-primary hover:underline"
              >
                Åpne godkjenningskø →
              </Link>
            </div>
          )}
        </div>

        <div>
          <SectionNum num="04" title="Krever oppmerksomhet" />
          <FokusSpillerPanel spillere={fokusSpillere} />
        </div>
      </section>

      <footer className="mt-8 flex items-center justify-between border-t border-border pt-5 text-[12px] text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.08em]">
          AgencyOS · Daglig brief
        </span>
        <span className="font-mono tabular-nums">Uke {ukeNr} · {klokke}</span>
      </footer>
    </div>
  );
}

// ── Komponenter ─────────────────────────────────────────────────

function SectionNum({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {num}
      </span>
      <span className="font-display text-[14px] font-bold tracking-tight text-foreground">
        {title}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  foot,
  footLink,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  foot?: string;
  footLink?: { text: string; href: string };
  tone?: "accent";
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card px-[18px] py-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md",
            tone === "accent" ? "bg-accent text-primary" : "bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <div className="font-mono text-[34px] font-bold leading-none tabular-nums tracking-[-0.02em] text-foreground">
        {value}
      </div>
      <div className="flex items-center gap-2 text-[12px]">
        {foot && <span className="text-muted-foreground">{foot}</span>}
        {footLink && (
          <Link href={footLink.href} className="text-primary hover:underline">
            {footLink.text}
          </Link>
        )}
      </div>
    </div>
  );
}

function Rec({
  icon: Icon,
  tone,
  title,
  desc,
}: {
  icon: LucideIcon;
  tone: "accent" | "primary" | "muted";
  title: string;
  desc: string;
}) {
  const iconStyles =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "muted"
        ? "bg-secondary text-muted-foreground"
        : "bg-accent text-primary";
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-md",
          iconStyles,
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[13.5px] font-semibold text-foreground">{title}</div>
        <div className="text-[12px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}


function EmptyRow({
  icon: Icon,
  title,
  meta,
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-6 py-6">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div>
        <div className="text-[13.5px] font-medium text-foreground">{title}</div>
        <div className="text-[12px] text-muted-foreground">{meta}</div>
      </div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={cn(
        "px-4 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground",
        right ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}
