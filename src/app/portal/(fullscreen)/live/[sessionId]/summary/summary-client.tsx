"use client";

// Client-komponent for Live-økt summary.
// Speiler public/design/batch4/live-okt-summary.html — celebration-skjerm
// med forest-bakgrunn, lime accent, og editorial italic i hero.

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  MessageCircle,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SummaryData, SummaryGoal, SummaryHighlight } from "./page";

type Props = { data: SummaryData };

const VAS_WORDS = [
  "—",
  "SLITSOM",
  "TUNG",
  "MIDDELS",
  "GREIT",
  "OK",
  "BRA",
  "GODT",
  "GODT",
  "VELDIG GODT",
  "FLOW",
] as const;

const QUICK_TAGS = [
  "Bedre tempo",
  "Funnet mønster",
  "Pust hjelper",
  "Mer trygghet",
] as const;

export function SummaryClient({ data }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Klokke i topbar.
  const [clock, setClock] = useState<string>(() => formatClock(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Refleksjon.
  const [activeTags, setActiveTags] = useState<Set<string>>(
    () => new Set(["Pust hjelper"]),
  );
  const [reflection, setReflection] = useState<string>(
    "Tempoet ble bedre da jeg pustet ut på baksving. Vil prøve det igjen neste økt — og spesielt fra 70m hvor jeg fortsatt misser litt venstre.",
  );

  // VAS-slider.
  const [vas, setVas] = useState<number>(8);
  const vasWord = useMemo(() => VAS_WORDS[vas] ?? "—", [vas]);

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function handleSendToCoach() {
    // Server-action wiring kan kobles til senere. Naviger til coach-tråd som
    // standard handling.
    startTransition(() => {
      router.push("/portal/coach");
    });
  }

  function handleLogNew() {
    startTransition(() => {
      router.push("/portal/ny-okt");
    });
  }

  return (
    <div
      className="min-h-screen min-h-dvh text-[var(--ak-cream)] font-sans"
      style={
        {
          // Lokale CSS-variabler kun for denne skjermen.
          ["--ak-bg" as string]: "#0F2A22",
          ["--ak-panel" as string]: "rgba(255,255,255,0.04)",
          ["--ak-panel-2" as string]: "rgba(255,255,255,0.07)",
          ["--ak-cream" as string]: "#FAFAF7",
          ["--ak-cream-70" as string]: "rgba(250,250,247,0.72)",
          ["--ak-cream-55" as string]: "rgba(250,250,247,0.55)",
          ["--ak-cream-35" as string]: "rgba(250,250,247,0.35)",
          ["--ak-border" as string]: "rgba(250,250,247,0.10)",
          ["--ak-border-strong" as string]: "rgba(250,250,247,0.18)",
          ["--ak-accent" as string]: "#D1F843",
          ["--ak-accent-soft" as string]: "rgba(209,248,67,0.15)",
          ["--ak-warn" as string]: "#EAA952",
          ["--ak-warn-soft" as string]: "rgba(234,169,82,0.16)",
          backgroundColor: "var(--ak-bg)",
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(209,248,67,0.06), transparent 50%), radial-gradient(ellipse 80% 50% at bottom, rgba(0,88,64,0.30), transparent 60%)",
          backgroundAttachment: "fixed",
        } as React.CSSProperties
      }
    >
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
        <div className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-[0.08em] tabular-nums">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "var(--ak-cream-55)" }}
          />
          <span>{clock}</span>
        </div>
        <Link
          href="/portal/tren"
          aria-label="Lukk"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border bg-transparent"
          style={{
            borderColor: "var(--ak-border-strong)",
            color: "var(--ak-cream-70)",
          }}
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </header>

      {/* Stage */}
      <main className="mx-auto flex max-w-[720px] flex-col gap-6 px-4 pb-32 pt-4 sm:gap-9 sm:px-7 sm:pb-48">
        {/* Hero */}
        <section className="flex flex-col gap-3">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h1
            className="font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.025em]"
            style={{ color: "var(--ak-cream)" }}
          >
            <em
              className="font-display italic"
              style={{ color: "var(--ak-accent)", fontWeight: 400 }}
            >
              {data.heroEm}
            </em>
          </h1>
          <p
            className="font-display text-[22px] italic leading-[1.4]"
            style={{ color: "var(--ak-cream-70)", fontWeight: 400 }}
          >
            {data.subline}
          </p>
          <div
            className="mt-1 flex flex-wrap gap-3.5 font-mono text-[10.5px] uppercase tracking-[0.10em]"
            style={{ color: "var(--ak-cream-55)" }}
          >
            <span>{data.metaLeft}</span>
            <span style={{ color: "var(--ak-cream-35)" }}>·</span>
            <span>{data.metaRight}</span>
          </div>
        </section>

        {/* KPI */}
        <Section title="Tallene" sub="SAMMENDRAG">
          <div className="grid grid-cols-3 gap-2.5 max-[640px]:grid-cols-2">
            <KpiCard
              big
              label="Mål oppnådd"
              value={data.kpiMain.value}
              valueSub={data.kpiMain.valueSub}
              unit={data.kpiMain.unit}
              className="max-[640px]:col-span-full"
            />
            <KpiCard
              label="Varighet"
              value={data.kpiVarighet.value}
              valueSub={data.kpiVarighet.valueSub}
              unit={data.kpiVarighet.unit}
            />
            <KpiCard
              label="Antall shots"
              value={data.kpiReps.value}
              valueSub={data.kpiReps.valueSub}
              unit={data.kpiReps.unit}
            />
          </div>
        </Section>

        {/* Mål */}
        <Section title="Slik gikk det mot målene" sub={`${data.goals.length} MÅL`}>
          <div className="flex flex-col gap-2.5">
            {data.goals.map((g) => (
              <GoalRow key={g.id} goal={g} />
            ))}
          </div>
        </Section>

        {/* Highlights */}
        <Section title="Highlights" sub="3 OBSERVASJONER">
          <div className="grid grid-cols-3 gap-2.5 max-[640px]:grid-cols-1">
            {data.highlights.map((h, i) => (
              <HighlightCard key={i} hl={h} />
            ))}
          </div>
        </Section>

        {/* Coach-notater */}
        <Section title="Coach-notater" sub="FRA ØKTEN">
          <div
            className="flex flex-col gap-3 rounded-2xl border p-5"
            style={{
              borderColor: "var(--ak-border)",
              backgroundColor: "var(--ak-panel)",
            }}
          >
            <CoachNote
              icon={<MessageCircle className="h-4 w-4" strokeWidth={1.75} />}
              label={`Notat fra ${data.coachName}`}
              text="Pust ut på baksving — du beholdt rytmen. Test samme cue fra 70m neste økt."
            />
            <CoachNote
              icon={<Lightbulb className="h-4 w-4" strokeWidth={1.75} />}
              label="Spørsmål til neste økt"
              text="Hvordan kjennes setup når du tar et halvt skritt nærmere ballen?"
            />
            <CoachNote
              icon={<Activity className="h-4 w-4" strokeWidth={1.75} />}
              label="Video sendt"
              text="3 klipp fra PW 62m — tagget med tempo-cue."
            />
          </div>
        </Section>

        {/* AI-oppsummering */}
        <Section title="AI-oppsummering" sub="GENERERT NÅ">
          <div
            className="flex items-start gap-3 rounded-2xl border p-5"
            style={{
              borderColor: "rgba(209,248,67,0.25)",
              backgroundImage:
                "linear-gradient(165deg, rgba(209,248,67,0.10), rgba(209,248,67,0.02))",
            }}
          >
            <span
              className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--ak-accent-soft)",
                color: "var(--ak-accent)",
              }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p
              className="font-display text-[17px] leading-[1.45]"
              style={{ color: "var(--ak-cream)" }}
            >
              {data.aiSummary}
            </p>
          </div>
        </Section>

        {/* Refleksjon */}
        <Section title="Refleksjon" sub="VALGFRITT · MAX 300 TEGN">
          <div
            className="flex flex-col gap-4 rounded-[18px] border p-6"
            style={{
              borderColor: "var(--ak-border)",
              backgroundColor: "var(--ak-panel)",
            }}
          >
            <p
              className="font-display text-[24px] italic leading-[1.3] tracking-[-0.005em]"
              style={{ color: "var(--ak-cream)", fontWeight: 400 }}
            >
              Hva tar du med deg fra økten?
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const active = activeTags.has(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                    )}
                    style={
                      active
                        ? {
                            backgroundColor: "var(--ak-accent)",
                            borderColor: "var(--ak-accent)",
                            color: "var(--ak-bg)",
                            fontWeight: 600,
                          }
                        : {
                            backgroundColor: "transparent",
                            borderColor: "var(--ak-border-strong)",
                            color: "var(--ak-cream-70)",
                          }
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value.slice(0, 300))}
              maxLength={300}
              placeholder="… eller skriv egne ord"
              className="min-h-[96px] w-full resize-none rounded-2xl border p-4 text-[14px] leading-[1.5] outline-none transition-colors"
              style={{
                backgroundColor: "rgba(15,42,34,0.5)",
                borderColor: "var(--ak-border-strong)",
                color: "var(--ak-cream)",
              }}
            />
            <span
              className="self-end font-mono text-[10.5px] tracking-[0.06em]"
              style={{ color: "var(--ak-cream-35)" }}
            >
              {reflection.length} / 300
            </span>
          </div>
        </Section>

        {/* VAS */}
        <Section title="Hvordan føltes økten?" sub="STEMNING 1–10">
          <div
            className="flex flex-col gap-4 rounded-[18px] border p-6"
            style={{
              borderColor: "var(--ak-border)",
              backgroundColor: "var(--ak-panel)",
            }}
          >
            <p
              className="font-display text-[22px] italic leading-[1.3]"
              style={{ color: "var(--ak-cream)", fontWeight: 400 }}
            >
              Hvordan føltes økten i kroppen?
            </p>
            <div className="flex items-baseline gap-2.5 font-mono tabular-nums">
              <span
                className="text-[56px] font-bold leading-none tracking-[-0.04em]"
                style={{ color: "var(--ak-accent)" }}
              >
                {vas}
              </span>
              <span
                className="text-[18px] tracking-[0.04em]"
                style={{ color: "var(--ak-cream-55)" }}
              >
                / 10
              </span>
              <span
                className="ml-auto font-display text-[14px] font-semibold uppercase tracking-[0.04em]"
                style={{ color: "var(--ak-cream-70)" }}
              >
                {vasWord}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={vas}
              onChange={(e) => setVas(Number.parseInt(e.target.value, 10))}
              aria-label="Stemning 1 til 10"
              className="h-[6px] w-full appearance-none rounded-full outline-none"
              style={{
                background: `linear-gradient(90deg, rgba(209,248,67,0.20) 0%, var(--ak-accent) ${
                  vas * 10
                }%, rgba(250,250,247,0.10) ${vas * 10}%, rgba(250,250,247,0.10) 100%)`,
              }}
            />
            <div
              className="-mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em]"
              style={{ color: "var(--ak-cream-35)" }}
            >
              <span>1 · slitsom</span>
              <span>5 · greit</span>
              <span>10 · flow</span>
            </div>
          </div>
        </Section>

        {/* Actions */}
        <section className="mt-2 grid grid-cols-[1fr_auto] gap-3 max-[640px]:grid-cols-1">
          <button
            type="button"
            onClick={handleSendToCoach}
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 font-display text-[15px] font-bold tracking-[-0.005em] transition-transform hover:-translate-y-px"
            style={{
              backgroundColor: "var(--ak-accent)",
              color: "var(--ak-bg)",
              boxShadow:
                "0 12px 32px rgba(209,248,67,0.20), 0 0 0 1px rgba(209,248,67,0.30)",
            }}
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
            Del med coach
          </button>
          <button
            type="button"
            onClick={handleLogNew}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-transparent px-5 py-4 font-display text-[14px] font-semibold"
            style={{
              borderColor: "var(--ak-border-strong)",
              color: "var(--ak-cream-70)",
            }}
          >
            Logg ny økt
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <Link
            href="/portal/tren"
            className="col-span-2 inline-flex items-center justify-center rounded-2xl border bg-transparent px-5 py-4 font-display text-[14px] font-semibold max-[640px]:col-span-1"
            style={{
              borderColor: "var(--ak-border-strong)",
              color: "var(--ak-cream-70)",
            }}
          >
            Tilbake til Workbench
          </Link>
        </section>
      </main>
    </div>
  );
}

/* ─── Subkomponenter ──────────────────────────────────────────────── */

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          className="font-display text-[14px] font-semibold uppercase tracking-[0.10em]"
          style={{ color: "var(--ak-cream)" }}
        >
          {title}
        </h2>
        <span
          className="font-mono text-[10.5px] tracking-[0.08em]"
          style={{ color: "var(--ak-cream-35)" }}
        >
          {sub}
        </span>
      </div>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
      style={{ color: "var(--ak-accent)" }}
    >
      {children}
    </span>
  );
}

function KpiCard({
  label,
  value,
  valueSub,
  unit,
  big = false,
  className,
}: {
  label: string;
  value: string;
  valueSub?: string;
  unit: string;
  big?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border px-5 py-5",
        className,
      )}
      style={
        big
          ? {
              borderColor: "rgba(209,248,67,0.25)",
              backgroundImage:
                "linear-gradient(165deg, rgba(209,248,67,0.10), rgba(209,248,67,0.02))",
            }
          : {
              borderColor: "var(--ak-border)",
              backgroundColor: "var(--ak-panel)",
            }
      }
    >
      <span
        className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: "var(--ak-cream-55)" }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[36px] font-bold leading-none tabular-nums tracking-[-0.02em]"
        style={{ color: big ? "var(--ak-accent)" : "var(--ak-cream)" }}
      >
        {value}
        {valueSub ? (
          <small
            className="ml-1 font-mono text-[14px] font-medium"
            style={{ color: "var(--ak-cream-55)" }}
          >
            {valueSub}
          </small>
        ) : null}
      </span>
      <span
        className="font-mono text-[11px] tracking-[0.08em]"
        style={{ color: "var(--ak-cream-55)" }}
      >
        {unit}
      </span>
    </div>
  );
}

function GoalRow({ goal }: { goal: SummaryGoal }) {
  const isSuccess = goal.status === "success";
  const accent = isSuccess ? "var(--ak-accent)" : "var(--ak-warn)";
  const accentSoft = isSuccess ? "var(--ak-accent-soft)" : "var(--ak-warn-soft)";
  const borderStrong = isSuccess
    ? "rgba(209,248,67,0.30)"
    : "rgba(234,169,82,0.30)";

  return (
    <div
      className="grid grid-cols-[30px_1fr_auto] items-center gap-4 rounded-2xl border p-4 px-5"
      style={{
        borderColor: borderStrong,
        backgroundColor: "var(--ak-panel)",
      }}
    >
      <span
        className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full"
        style={{
          backgroundColor: isSuccess ? "var(--ak-accent)" : accentSoft,
          color: isSuccess ? "var(--ak-bg)" : accent,
        }}
      >
        {isSuccess ? (
          <Check className="h-4 w-4" strokeWidth={2.5} />
        ) : (
          <Target className="h-4 w-4" strokeWidth={1.75} />
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        <div
          className="font-display text-[15px] font-semibold leading-tight tracking-[-0.005em]"
          style={{ color: "var(--ak-cream)" }}
        >
          {goal.title}
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full"
            style={{ backgroundColor: "rgba(250,250,247,0.10)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, goal.progressPct))}%`,
                backgroundColor: accent,
              }}
            />
          </div>
          <span
            className="min-w-[64px] text-right font-mono text-[10.5px] tracking-[0.06em]"
            style={{ color: "var(--ak-cream-55)" }}
          >
            {goal.meta}
          </span>
        </div>
      </div>
      <div
        className="max-w-[130px] text-right font-mono text-[11px] font-semibold uppercase leading-tight tracking-[0.10em]"
        style={{ color: accent }}
      >
        {goal.verdictTitle}
        <br />
        <span style={{ color: "var(--ak-cream-55)" }}>{goal.verdictSub}</span>
      </div>
    </div>
  );
}

function HighlightCard({ hl }: { hl: SummaryHighlight }) {
  const palette = (() => {
    switch (hl.kind) {
      case "best":
        return {
          head: "var(--ak-accent)",
          pip: "var(--ak-accent)",
          pipShadow: "0 0 8px var(--ak-accent)",
          em: "var(--ak-accent)",
          icon: <CheckCircle2 className="h-3 w-3" strokeWidth={2} />,
        };
      case "tend":
        return {
          head: "var(--ak-warn)",
          pip: "var(--ak-warn)",
          pipShadow: "none",
          em: "var(--ak-warn)",
          icon: <TrendingUp className="h-3 w-3" strokeWidth={2} />,
        };
      case "pr":
      default:
        return {
          head: "var(--ak-cream-70)",
          pip: "var(--ak-cream-70)",
          pipShadow: "none",
          em: "var(--ak-cream-70)",
          icon: <Target className="h-3 w-3" strokeWidth={2} />,
        };
    }
  })();

  return (
    <div
      className="flex min-h-[130px] flex-col gap-2 rounded-2xl border p-4 px-5"
      style={{
        borderColor: "var(--ak-border)",
        backgroundColor: "var(--ak-panel)",
      }}
    >
      <div
        className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: palette.head }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: palette.pip, boxShadow: palette.pipShadow }}
        />
        {palette.icon}
        <span>{hl.label}</span>
      </div>
      <div
        className="font-display text-[20px] font-semibold leading-[1.15] tracking-[-0.01em]"
        style={{ color: "var(--ak-cream)" }}
      >
        <em
          className="not-italic font-mono text-[26px] font-bold tabular-nums"
          style={{ color: palette.em, marginRight: 4 }}
        >
          {hl.mainEm}
        </em>
        {hl.mainText}
      </div>
      <p
        className={cn(
          "mt-auto text-[12.5px] leading-[1.4]",
          hl.noteItalic && "font-display italic",
        )}
        style={{ color: hl.noteItalic ? "var(--ak-cream-70)" : "var(--ak-cream-55)" }}
      >
        {hl.note}
      </p>
    </div>
  );
}

function CoachNote({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr] items-start gap-3">
      <span
        className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg"
        style={{
          backgroundColor: "var(--ak-panel-2)",
          color: "var(--ak-accent)",
        }}
      >
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <span
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--ak-cream-55)" }}
        >
          {label}
        </span>
        <p
          className="text-[14px] leading-[1.45]"
          style={{ color: "var(--ak-cream)" }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function formatClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
