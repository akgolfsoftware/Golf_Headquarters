import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  LayoutGrid,
  Mail,
  Settings,
  Star,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PrintButton } from "@/components/shared/print-button";
import {
  getBriefData,
  bygBriefSystemPrompt,
  bygBriefUserPrompt,
} from "@/lib/admin-brief";
import { anthropicKlient, COACH_MODEL } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export default async function DagligBrief() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await getBriefData(coach);

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
  const eyebrow = idag
    .toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toLowerCase();
  const ukeNr = (() => {
    const d = new Date(
      Date.UTC(idag.getFullYear(), idag.getMonth(), idag.getDate()),
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  })();

  const startTid = data.dagensTimer.start?.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sluttTid = data.dagensTimer.slutt?.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1200px]">
        {/* Hero */}
        <header className="mb-8 flex items-start justify-between gap-6 border-b border-border pb-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {eyebrow} · uke {ukeNr}
            </div>
            <h1 className="mt-2 font-display text-[22px] sm:text-[28px] md:text-[36px] font-semibold italic leading-[1.1] tracking-tight">
              <em className="italic">
                {idag.toLocaleDateString("nb-NO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                .{" "}
                {data.dagensTimer.antall === 0
                  ? "Ingen økter på timeplanen."
                  : `${data.dagensTimer.antall} ${data.dagensTimer.antall === 1 ? "økt" : "økter"} på timeplanen.`}
              </em>
            </h1>
            <div className="mt-2 text-[13px] text-muted-foreground">
              Brief generert{" "}
              {idag.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · Genereres på nytt ved hvert besøk
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <PrintButton />
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary"
            >
              <Settings className="h-4 w-4" />
              Innstillinger
            </Link>
            <button
              type="button"
              disabled
              title="Kommer i v2"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
            >
              <Mail className="h-4 w-4" />
              Send som e-post
            </button>
          </div>
        </header>

        {/* KPI-strip */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi
            label="Dagens timer"
            value={String(data.dagensTimer.antall)}
            foot={
              data.dagensTimer.antall === 0
                ? "Ingen bookinger"
                : `${startTid}–${sluttTid}`
            }
          />
          <Kpi
            label="Ventende godkjenninger"
            value={String(data.ventendeGodkjenninger)}
            footLink={
              data.ventendeGodkjenninger > 0
                ? "venter på godkjenning →"
                : undefined
            }
            foot={
              data.ventendeGodkjenninger === 0 ? "Alt avklart" : undefined
            }
          />
          <Kpi
            label="Ubesvarte meldinger"
            value={String(data.ubesvarteMeldinger)}
            foot={
              data.ubesvarteMeldinger === 0
                ? "Innboks ryddig"
                : "direkte-meldinger"
            }
          />
          <Kpi
            label="Agent-output · 7d"
            value={String(data.ukenGenerert.signals)}
            foot={`${data.ukenGenerert.planActions} plan-forslag`}
          />
        </div>

        {/* 01 — AI-brief */}
        <section className="mb-10">
          <SectionNum num="01" title="AI-brief · oppsummering av dagen" />
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-8">
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
        <section className="mb-10">
          <SectionNum
            num="02"
            title={`Nyligste runder · ${data.nyligeRunder.length}`}
          />
          {data.nyligeRunder.length === 0 ? (
            <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card px-6 py-6">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-[13.5px] font-medium">
                  Ingen runder siste 24 timer
                </div>
                <div className="text-[12px] text-muted-foreground">
                  Når spillere registrerer runder dukker de opp her.
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="px-4 py-4 text-left font-mono text-[10px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
                      Spiller
                    </th>
                    <th className="px-4 py-4 text-left font-mono text-[10px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
                      Bane
                    </th>
                    <th className="px-4 py-4 text-right font-mono text-[10px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
                      SG-tot
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[13px]">
                  {data.nyligeRunder.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4 font-medium text-foreground">
                        {r.spiller}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {r.bane}
                      </td>
                      <td
                        className={`px-4 py-4 text-right font-mono tabular-nums ${
                          r.sgTotal != null && r.sgTotal >= 0
                            ? "text-primary"
                            : r.sgTotal != null
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
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

        {/* 03 + 04 — placeholder for agent-anbefalinger og oppmerksomhet */}
        <section className="mb-10">
          <div className="grid grid-cols-2 items-start gap-8">
            <div>
              <SectionNum num="03" title="Agentenes anbefalinger" />
              {/* TODO: hent agent-anbefalinger fra PlanAction-tabellen */}
              <div className="flex flex-col gap-4">
                <Rec
                  icon={<Bot className="h-4 w-4" />}
                  tone="primary"
                  title="Agent-pipeline aktiv"
                  desc={`${data.ukenGenerert.signals} signaler beregnet og ${data.ukenGenerert.planActions} plan-forslag laget siste 7 dager.`}
                />
                {data.ventendeGodkjenninger > 0 && (
                  <Rec
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    tone="accent"
                    title={`${data.ventendeGodkjenninger} forslag venter`}
                    desc="Gå til godkjenningskøen for å gjennomgå nye anbefalinger fra agentene."
                  />
                )}
              </div>
              {data.ventendeGodkjenninger > 0 && (
                <div className="mt-3.5 flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">
                    {data.ventendeGodkjenninger} forslag venter på godkjenning
                  </span>
                  <a
                    href="/admin/approvals"
                    className="text-[13px] font-medium text-primary hover:underline"
                  >
                    Åpne approvals-kø →
                  </a>
                </div>
              )}
            </div>

            <div>
              <SectionNum num="04" title="Krever oppmerksomhet" />
              <div className="rounded-xl border border-border bg-card px-6 py-2">
                {data.ubesvarteMeldinger > 0 ? (
                  <AttnRow
                    icon={<Mail className="h-4 w-4" />}
                    title={`${data.ubesvarteMeldinger} ubesvarte meldinger`}
                    meta="Direkte-meldinger fra spillere eller foreldre"
                    linkText="Åpne →"
                    linkHref="/admin/messages"
                  />
                ) : (
                  <AttnRow
                    icon={<Star className="h-4 w-4" />}
                    title="Alt under kontroll"
                    meta="Ingen ubesvarte meldinger eller forfalte oppgaver akkurat nå."
                    linkText=""
                    last
                  />
                )}
                {/* TODO: legg til forfalte fakturaer, utløpende planer m.m. */}
              </div>
            </div>
          </div>
        </section>

        {/* 05 — Ukens fokus */}
        <section>
          <SectionNum num="05" title={`Ukens prioritet · uke ${ukeNr}`} />
          <div className="flex items-center justify-between gap-8 rounded-xl border border-border bg-card p-6">
            <div className="flex-1">
              <div className="mb-1.5 font-display text-[18px] font-semibold tracking-tight">
                Fokus denne uka
              </div>
              <div className="text-[13.5px] text-muted-foreground">
                Hold tempoet oppe på agent-godkjenninger og direkte-meldinger.
                Sjekk pyramide-balansen for hver spiller før helga.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionNum({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-3.5 flex items-center gap-3.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {num}
      </span>
      <em className="font-display text-[13px] font-semibold not-italic tracking-tight text-foreground">
        {title}
      </em>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Kpi({
  label,
  value,
  foot,
  footLink,
}: {
  label: string;
  value: string;
  foot?: string;
  footLink?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-[28px] font-semibold leading-none tracking-tight">
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[12px]">
        {foot && <span className="text-muted-foreground">{foot}</span>}
        {footLink && (
          <a
            href="/admin/approvals"
            className="text-[12px] text-primary hover:underline"
          >
            {footLink}
          </a>
        )}
      </div>
    </div>
  );
}

function Rec({
  icon,
  tone,
  title,
  desc,
}: {
  icon: React.ReactNode;
  tone: "accent" | "primary" | "warn";
  title: string;
  desc: string;
}) {
  const iconStyles =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "warn"
        ? "bg-muted text-muted-foreground"
        : "bg-accent/30 text-primary";
  return (
    <div className="flex gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5">
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${iconStyles}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[13.5px] font-medium">{title}</div>
        <div className="text-[12px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function AttnRow({
  icon,
  title,
  meta,
  linkText,
  linkHref,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  linkText: string;
  linkHref?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3.5 py-3.5 ${last ? "" : "border-b border-border"}`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[13.5px] font-medium">{title}</div>
        <div className="text-[12px] text-muted-foreground">{meta}</div>
      </div>
      {linkText && linkHref && (
        <a
          href={linkHref}
          className="text-[13px] font-medium text-primary hover:underline"
        >
          {linkText}
        </a>
      )}
    </div>
  );
}
