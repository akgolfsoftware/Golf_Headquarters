"use client";

/**
 * HybridHomePage — PlayerHQ Hjem (/portal). v14-REDESIGN (2026-07-08): tre
 * kortvekter fra design-prosjektets signatur-oppgradering (7. jul), bygget
 * med ekte data i stedet for demo-tall.
 *
 *   (a) ÉTT signaturmoment — SG-hero: foto (peak-misty) bak mørk gradient-
 *       scrim, KpiTile xl (ekte SG-total) + sparkline (ekte siste 10 runder)
 *       + streak (ekte fullførte dager denne uka).
 *   (b) Medium handlingskort, forest-aksent — NesteFokusKort (dommen: største
 *       ekte SG-lekkasje) + NesteOktCard (dagens ekte planlagte økt, Start-CTA).
 *   (c) Stille rader — resten av dagens plan, ingen kort-ramme.
 *
 * Pluss: ekte DayStrip (uke-data), Mål-rad m/ RingGauge (ekte mål-fremdrift),
 * SG-detalj (SgTotalKort/SgKategoriBar, uendret forklaringslag), ekte
 * 12-ukers treningshistorikk-heatmap, WeekProgress, Hva er nytt, Coach-notat.
 *
 * MERK — AiTipCard bevisst utelatt: DashboardData har ingen egen AI-generert
 * innsikt utover NesteFokusKort sin dom (samme kilde), og appen skal aldri
 * vise oppdiktet AI-tekst. Legges til når en ekte, distinkt innsikt-kilde finnes.
 *
 * Tekst styrt av ordboken (docs/skjermtekst/): klarspråk for spiller, SG m/ fortegn +
 * baseline, «Start økt», tomtilstander med «—». All data via props fra page.tsx.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, ChevronRight, CalendarRange, Activity } from "lucide-react";
import {
  Card, Eyebrow, KpiTile, NesteFokusKort, SgTotalKort, SgKategoriBar, DayStrip, RingGauge, Progress, Heatmap, AgendaRow,
  type SgKategori, type DayStripDay,
} from "@/components/athletic/golfdata";
import { WeekProgress } from "./WeekProgress";
import type { DashboardData, TodaySession } from "@/app/portal/actions";

// ── helpers ───────────────────────────────────────────────────────

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
}
function formatWeekDay(d: Date): string {
  return d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });
}
function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function timeAgo(d: Date): string {
  const diffMin = Math.round((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 60) return `${Math.max(0, diffMin)} min siden`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} t siden`;
  return `${Math.floor(diffH / 24)} d siden`;
}
function fmtSg(v: number | null): string {
  if (v == null) return "–";
  const s = Math.abs(v).toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (v >= 0 ? "+" : "−") + s;
}

// ── SG-akse-metadata (klarspråk + fokus-tekst per ordbok) ──────────
type AkseKey = "ott" | "app" | "arg" | "putt";
const SG_META: Record<AkseKey, { akse: SgKategori["akse"]; klar: string; omrade: string; handling: string }> = {
  ott: { akse: "OTT", klar: "Tee-slag", omrade: "Slag fra tee", handling: "Legg inn tee-økt" },
  app: { akse: "APP", klar: "Innspill", omrade: "Innspill 50–100 m", handling: "Legg inn innspill-økt" },
  arg: { akse: "ARG", klar: "Nærspill", omrade: "Nærspill rundt green", handling: "Legg inn nærspill-økt" },
  putt: { akse: "PUTT", klar: "Putting", omrade: "Putting innenfor 6 ft", handling: "Legg inn putting-økt" },
};

const DOW_BOKSTAV = ["M", "T", "O", "T", "F", "L", "S"]; // mandag først, matcher getWeekOverview

const AKSE_IKON: Record<string, string> = { FYS: "dumbbell", TEK: "target", SLAG: "flag", SPILL: "flag", TURN: "flag" };

// ── (a) DET signaturmomentet — SG-hero ─────────────────────────────

function SgHero({ kpiStats, streakActive }: { kpiStats: DashboardData["kpiStats"]; streakActive: number }) {
  return (
    <section
      aria-label="Strokes Gained siste 30 dager"
      className="dark relative overflow-hidden rounded-[var(--radius-card)] p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid color-mix(in srgb, var(--signal) 16%, var(--border))",
        boxShadow: "var(--shadow-raised, 0 1px 2px rgba(0,0,0,.3)), 0 10px 34px rgba(209,248,67,0.10)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- design-asset, ikke bruker-opplastet innhold */}
      <img
        src="/design-handover/assets/imagery/peak-misty.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
        style={{ objectPosition: "center 35%" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(155deg, rgba(10,11,10,0.55) 0%, rgba(10,11,10,0.88) 72%, rgba(10,11,10,0.96) 100%)" }}
      />
      <div className="relative z-10 flex flex-col gap-3.5">
        <Eyebrow tone="signal">Strokes Gained · siste 10 runder</Eyebrow>
        <div className="flex items-end justify-between gap-3.5">
          <KpiTile
            value={kpiStats.sgTotal != null ? fmtSg(kpiStats.sgTotal) : "–"}
            unit="SG"
            sparkline={kpiStats.sgTrend.length > 1 ? kpiStats.sgTrend : undefined}
            size="xl"
          />
          <div className="flex-none pb-1 text-right">
            <div
              className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground"
            >
              Streak
            </div>
            <Progress variant="streak" total={7} active={streakActive} label={`${streakActive} av 7`} style={{ whiteSpace: "nowrap" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── (b) Medium handlingskort — «Neste økt». Portet 1:1 fra designprosjektets
// NesteOktCard (phq-home.jsx, 8. jul): samme diskré kortstil som resten av
// skjermen (var(--surface), 1px border, forest venstrekant), ikke en egen
// stor hero-blokk. Erstatter den tidligere hardkodede forest-gradient-heroen.

function NesteOktCard({ session }: { session: TodaySession }) {
  const aktiv = session.status === "IN_PROGRESS";
  return (
    <Link
      href={`/portal/live/${session.id}`}
      className="flex flex-col gap-3 rounded-[var(--radius-card,16px)] border border-border bg-card p-4"
      style={{ borderLeft: "3px solid var(--brand, hsl(var(--primary)))" }}
    >
      <div className="flex items-center gap-2">
        <Activity size={13} className="flex-none text-primary" aria-hidden />
        <span className="text-[13px] leading-snug text-foreground/80">
          <strong className="font-semibold text-foreground">Dagens økt:</strong> {session.drills.length} drills
          {session.sted ? ` · ${session.sted}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[11px] font-bold text-primary">
            {aktiv ? "PÅGÅR" : "NÅ"} · {formatTime(session.startTime)}
          </span>
          <p className="mt-0.5 truncate text-[16px] font-semibold text-foreground">{session.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{session.durationMin} min</p>
        </div>
        <span className="flex flex-none items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 font-mono text-[11.5px] font-bold uppercase tracking-[0.05em] text-primary-foreground">
          {aktiv ? "Fortsett" : "Start økt"}
          <Play size={14} fill="currentColor" strokeWidth={0} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

// ── Mål-rad — RingGauge, egen anatomi (ikke chevron-rad) ───────────

function MalRow({ goals, onOpen }: { goals: DashboardData["goals"]; onOpen: () => void }) {
  const gjennomsnitt = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3.5 rounded-[var(--radius-card,16px)] border border-border bg-card px-4 py-3 text-left"
    >
      <RingGauge value={gjennomsnitt} min={0} max={100} size={46} thickness={5} decimals={0} unit="%" color="var(--signal, hsl(var(--primary)))" />
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-semibold text-foreground">Mine mål &amp; SG-Hub</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {goals.length === 0 ? "Ingen aktive mål" : goals.length === 1 ? "1 aktivt mål" : `${goals.length} aktive mål`}
        </p>
      </div>
      <ChevronRight size={17} className="flex-none text-muted-foreground" aria-hidden />
    </button>
  );
}

// ── Hva er nytt ────────────────────────────────────────────────────

function HvaErNytt({ items }: { items: DashboardData["recentActivity"] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <Eyebrow>Hva er nytt</Eyebrow>
      <div className="space-y-2">
        {items.slice(0, 3).map((a) => (
          <Link key={a.id} href={a.href} className="block">
            <Card interactive compact>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity size={14} strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-foreground">{a.drillName}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground tabular-nums">
                    {a.sessionTitle}
                    {a.successRate != null ? ` · ${Math.round(a.successRate)} %` : ""} · {timeAgo(a.loggedAt)}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Coach-notat ────────────────────────────────────────────────────

function CoachNoteCard({ message }: { message: DashboardData["coachMessage"] }) {
  if (!message) return null;
  return (
    <div className="space-y-2.5">
      <Eyebrow>Coach</Eyebrow>
      <Link href={message.href} className="block">
        <Card interactive>
          <div className="mb-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary font-mono text-[12px] font-bold text-accent ring-2 ring-card ring-offset-[2px] ring-offset-primary">
              {message.coachInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-bold leading-tight tracking-[-0.01em] text-foreground">
                {message.coachName}
              </p>
              <p className="mt-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Head Coach
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
              {timeAgo(message.createdAt)}
            </span>
          </div>
          <p className="line-clamp-4 text-[15px] leading-[1.55] text-foreground">{message.preview}</p>
          <div className="mt-3 flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
            Les mer <ChevronRight size={12} aria-hidden />
          </div>
        </Card>
      </Link>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────

export type HybridHomePageProps = { data: DashboardData };

export function HybridHomePage({ data }: HybridHomePageProps) {
  const router = useRouter();
  const { user, greeting, today, todayAll, week, coachMessage, kpiStats, recentActivity, weekProgress, weekNumber, goals, trainingHeatmap } = data;

  const now = new Date();
  const dateEyebrow = `${capitalise(formatWeekDay(now))} · ${formatTime(now)}`;

  const bd = kpiStats.sgBreakdown;
  const hasSgBreakdown = (["ott", "app", "arg", "putt"] as const).some((k) => bd[k] != null);
  const sgKategorier: SgKategori[] = (["ott", "app", "arg", "putt"] as const).map((k) => ({
    akse: SG_META[k].akse, sg: bd[k] ?? 0,
  }));

  // Dommen: svakeste akse (mest negativ / minst positiv) blir fokus.
  const svakest = (["ott", "app", "arg", "putt"] as const)
    .filter((k) => bd[k] != null)
    .reduce<AkseKey | null>((min, k) => (min === null || (bd[k] as number) < (bd[min] as number) ? k : min), null);
  const fokus = svakest ? SG_META[svakest] : null;
  const fokusSg = svakest ? (bd[svakest] as number) : null;

  // Ekte dag-strip fra ukens data.
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  const [valgtDato, setValgtDato] = useState<number>(now.getDate());
  const dagStripDager: DayStripDay[] = week.map((d, i) => ({
    dow: DOW_BOKSTAV[i] ?? d.dayLabel.charAt(0),
    date: d.dayNumber,
    today: d.isToday,
    state: !d.isToday && d.date.getTime() < todayMidnight.getTime() && d.sessions.length > 0 ? "done" : undefined,
    okter: d.sessions.length > 0 ? d.sessions.length : undefined,
  }));
  const streakActive = week.filter((d) => d.date.getTime() <= todayMidnight.getTime() && d.sessions.some((s) => s.status === "COMPLETED")).length;

  // Øvrige økter (utenom den som vises i hero).
  const restOkter = today ? todayAll.filter((s) => s.id !== today.id) : todayAll;

  const oktTekst = todayAll.length === 0 ? "Ingen økt i dag" : todayAll.length === 1 ? "Én økt i dag" : `${todayAll.length} økter i dag`;
  const lead = fokus
    ? `${oktTekst}. Største gevinst ligger i ${fokus.klar.toLowerCase()}.`
    : `${oktTekst}. Logg en runde for å se hvor du henter mest.`;

  return (
    <div className="golfdata-scope mx-auto max-w-[460px] space-y-5 px-0">
      {/* 1. Hilsen */}
      <div className="pt-1">
        <span className="mb-3 inline-flex items-center rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
          PlayerHQ · {user.tier}
        </span>
        <Eyebrow className="mb-2.5 block" style={{ fontSize: "var(--text-11)", letterSpacing: "0.16em" }}>
          {dateEyebrow}
        </Eyebrow>
        <h1 className="font-display text-[38px] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
          {greeting}, <em className="font-medium italic text-primary">{user.fornavn}.</em>
        </h1>
        <p className="mt-2.5 text-[15px] leading-[1.5] text-muted-foreground">{lead}</p>
      </div>

      {/* 2. Ukas dager — ekte data (fullført/i dag). Aktiv dag i forest, per
          designprosjektets --daystrip-active-bg-override (phq-home.jsx). */}
      <div
        style={
          {
            "--daystrip-active-bg": "var(--brand, hsl(var(--primary)))",
            "--daystrip-active-bg-hover": "var(--brand-hover, hsl(var(--primary)))",
            "--daystrip-active-text": "var(--on-brand, hsl(var(--primary-foreground)))",
          } as React.CSSProperties
        }
      >
        <DayStrip days={dagStripDager} value={valgtDato} onChange={setValgtDato} />
      </div>

      {/* 3. (a) Signaturmomentet — SG-hero */}
      <SgHero kpiStats={kpiStats} streakActive={streakActive} />

      {/* 4. (b) Medium handlingskort — dommen + dagens økt */}
      {fokus && fokusSg != null ? (
        <NesteFokusKort
          akse={fokus.akse}
          omrade={`${fokus.omrade} er største lekkasje`}
          sgTap={fmtSg(fokusSg)}
          baseline="Broadie scratch"
          begrunnelse={`Du taper mest på ${fokus.klar.toLowerCase()}. Én ${fokus.klar.toLowerCase()}-økt i uka lukker mesteparten av gapet.`}
          nivaa="ovet"
          handlingTekst={fokus.handling}
          onHandling={() => router.push("/portal/planlegge")}
        />
      ) : (
        <NesteFokusKort tomt nivaa="ovet" handlingTekst="Loggfør runde" onHandling={() => router.push("/portal/mal/runder/ny")} />
      )}

      {today ? (
        <NesteOktCard session={today} />
      ) : (
        <Card>
          <div className="flex items-center gap-3">
            <CalendarRange size={18} className="text-muted-foreground" strokeWidth={1.6} aria-hidden />
            <div className="flex-1">
              <p className="text-[15px] text-muted-foreground">Ingen økt planlagt i dag.</p>
              <Link href="/portal/planlegge" className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
                Planlegg økt <ArrowRight size={12} aria-hidden />
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* 5. Mine mål — RingGauge, ekte fremdrift */}
      <MalRow goals={goals} onOpen={() => router.push("/portal/mal")} />

      {/* 6. SG-detalj — forklaringslag under signaturmomentet */}
      <SgTotalKort
        verdi={fmtSg(kpiStats.sgTotal)}
        enhet="slag"
        baseline="Broadie scratch"
        runder={kpiStats.roundsCount}
        nivaa="ovet"
        tomt={kpiStats.sgTotal == null}
      />
      {hasSgBreakdown && <SgKategoriBar kategorier={sgKategorier} nivaa="ovet" baseline="Broadie scratch" />}
      <Card compact bodyStyle={{ padding: 0 }}>
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="px-4 py-4"><KpiTile size="md" label="Runder" value={kpiStats.roundsCount} deltaSuffix="siste 90 d" /></div>
          <div className="px-4 py-4">
            <KpiTile size="md" label="Snittscore" value={kpiStats.avgScore != null ? kpiStats.avgScore.toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : "–"} />
          </div>
        </div>
      </Card>

      {/* 7. (c) Stille rader — resten av dagens plan */}
      {restOkter.length > 0 && (
        <div className="space-y-2.5">
          <Eyebrow>Dagens plan</Eyebrow>
          <div className="flex flex-col gap-2.5">
            {restOkter.map((s) => (
              <AgendaRow
                key={s.id}
                time={formatTime(s.startTime)}
                icon={AKSE_IKON[s.pyramidArea] ?? "dumbbell"}
                title={s.title}
                subtitle={`${s.drills.length} drills`}
                duration={`${s.durationMin} min`}
                state={s.status === "IN_PROGRESS" ? "live" : s.status === "COMPLETED" ? "done" : "upcoming"}
                onClick={() => router.push(s.href)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 8. Ett klikk til hovedverktøy (optimalisert flyt) */}
      <div className="pt-2">
        <Eyebrow className="mb-2">Hovedverktøy</Eyebrow>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="/portal/planlegge/workbench" className="block">
            <Card interactive compact bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="text-sm font-medium text-foreground">Planlegg</span>
              <ArrowRight size={16} className="text-muted-foreground" />
            </Card>
          </Link>
          <Link href="/portal/gjennomfore" className="block">
            <Card interactive compact bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="text-sm font-medium text-foreground">Gjør / logg økt</span>
              <ArrowRight size={16} className="text-muted-foreground" />
            </Card>
          </Link>
          <Link href="/portal/analysere" className="block">
            <Card interactive compact bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="text-sm font-medium text-foreground">Analyser</span>
              <ArrowRight size={16} className="text-muted-foreground" />
            </Card>
          </Link>
          <Link href="/portal/meg/bookinger" className="block">
            <Card interactive compact bodyStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="text-sm font-medium text-foreground">Bookinger &amp; Meg</span>
              <ArrowRight size={16} className="text-muted-foreground" />
            </Card>
          </Link>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">Alltid 1 klikk fra hjem til det du trenger mest.</p>
      </div>

      {/* 8. Treningshistorikk — ekte 12-ukers heatmap */}
      <div>
        <Eyebrow className="mb-3 block">Historikk · 12 uker</Eyebrow>
        <Card compact>
          <Heatmap
            rows={trainingHeatmap.rows}
            cols={trainingHeatmap.cols}
            values={trainingHeatmap.values}
            cell={11}
            gap={3}
            fmt={(v) => (v === 0 ? "Ingen økt" : v >= 1 ? "2+ økter" : "1 økt")}
          />
        </Card>
      </div>

      {/* 9. Plan denne uka */}
      <WeekProgress progress={weekProgress} weekNumber={weekNumber} />

      {/* 10. Hva er nytt */}
      <HvaErNytt items={recentActivity} />

      {/* 11. Coach-notat */}
      <CoachNoteCard message={coachMessage} />
    </div>
  );
}
