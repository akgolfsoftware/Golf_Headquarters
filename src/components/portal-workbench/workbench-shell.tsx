/**
 * PlayerHQ Workbench — pixel-perfekt hjem (Variant A · klassisk stack)
 *
 * Spec: sesjon-1-hjem-og-spiller.md, skjerm 1.
 * Tokens: forest #005840, accent lime #D1F843, surface #FAFAF7.
 * 8pt-grid, 16px card-radius, 999px pills.
 *
 * Server Component — alle interaktive deler er passive (Link).
 */

import Link from "next/link";
import {
  ArrowRight,
  CloudSun,
  MessageSquare,
  Play,
  PlusCircle,
  TrendingDown,
  Trophy,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

const PYR_COLOR: Record<string, string> = {
  FYS: "#005840",
  TEK: "#1A7D56",
  SLAG: "#D1F843",
  SPILL: "#B8852A",
  TURN: "#5E5C57",
};

export type WorkbenchProps = {
  playerName: string;
  playerAvatarUrl: string | null;
  hcpString: string;
  tier: "GRATIS" | "PRO" | "ELITE" | string;
  weekFocus: string;
  // KPI
  snittScore: number | null;
  snittScoreDelta: string | null;
  nextTournament: { name: string; daysAway: number } | null;
  testerDone: number;
  testerTotal: number;
  hcpTrendDelta: string;
  // Dagens fokus
  todaysFocus: { time: string; title: string; durMin: number; location: string }[];
  // Pyramide-uke
  pyramideWeek: { day: string; isToday: boolean; drills: { area: string; count: number }[] }[];
  // Coach-ping
  coachPing: { coachName: string; text: string; href: string } | null;
  // Aktiv plan
  activePlan: { name: string; total: number; done: number; href: string } | null;
  // Neste milepæl
  nextMilestone: { title: string; daysLeft: number; sparkline: number[] } | null;
  // Aktivitet-feed
  activityFeed: {
    id: string;
    type: "okt" | "test" | "runde" | "melding";
    title: string;
    timeAgo: string;
  }[];
  // Weather (sample)
  weather: { tempC: number; cond: string; outdoorToday: boolean } | null;
};

function tierPillStyle(t: string): string {
  if (t === "PRO") return "bg-[#005840] text-[#D1F843]";
  if (t === "ELITE") return "bg-[#D1F843] text-[#005840]";
  return "bg-[#F1EEE5] text-[#0A1F17]";
}

function tierLabel(t: string): string {
  if (t === "PRO") return "PRO";
  if (t === "ELITE") return "ELITE";
  return "GRATIS";
}

export function WorkbenchShell(props: WorkbenchProps) {
  const fornavn = props.playerName.split(" ")[0];
  const etternavn = props.playerName.split(" ").slice(1).join(" ") || props.playerName;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <header className="rounded-2xl border border-[#E5E3DD] bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/portal/meg"
              className="block shrink-0"
              aria-label="Åpne min profil"
            >
              {props.playerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={props.playerAvatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-[#D1F843]/40 sm:h-24 sm:w-24"
                />
              ) : (
                <div
                  className="grid h-20 w-20 place-items-center rounded-full font-display text-2xl font-semibold text-white ring-2 ring-[#D1F843]/40 sm:h-24 sm:w-24 sm:text-3xl"
                  style={{ background: avatarBg(props.playerName) }}
                >
                  {initialsFromName(props.playerName)}
                </div>
              )}
            </Link>
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
                PLAYERHQ ·{" "}
                {new Date().toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight text-[#0A1F17] sm:text-4xl">
                God morgen,{" "}
                <em
                  className="font-normal not-italic"
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontStyle: "italic",
                    color: "#005840",
                  }}
                >
                  {fornavn}
                </em>
                {etternavn !== fornavn ? " " : ""}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#F1EEE5] px-3 py-1 font-mono text-[11px] font-semibold tabular-nums text-[#0A1F17]">
                  HCP {props.hcpString}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${tierPillStyle(
                    props.tier,
                  )}`}
                >
                  {tierLabel(props.tier)}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#005840]/8 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#005840]">
                  Fokus: {props.weekFocus}
                </span>
              </div>
            </div>
          </div>

          {props.weather && (
            <div
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 ${
                props.weather.outdoorToday
                  ? "border-[#D1F843] bg-[#D1F843]/15"
                  : "border-[#E5E3DD] bg-[#FAFAF7]"
              }`}
            >
              {props.weather.outdoorToday && (
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D1F843] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#005840]" />
                </span>
              )}
              <CloudSun size={16} strokeWidth={1.75} className="text-[#005840]" />
              <span className="font-mono text-[12px] font-semibold tabular-nums text-[#0A1F17]">
                {props.weather.tempC}°C
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                {props.weather.cond}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* KPI-strip — 4 celler med featured-first */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* Featured: Snittscore */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, #005840 0%, #003A2A 100%)",
          }}
        >
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-white/70">
            Snittscore
          </div>
          <div className="mt-2 font-mono text-[38px] font-semibold leading-none tabular-nums text-[#D1F843]">
            {props.snittScore != null
              ? props.snittScore.toFixed(1).replace(".", ",")
              : "—"}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#D1F843]/80">
            {props.snittScoreDelta ?? "siste 10 runder"}
          </div>
        </div>

        {/* Neste turnering */}
        <KpiTile
          eyebrow="Neste turnering"
          value={
            props.nextTournament
              ? props.nextTournament.name.split(" ")[0]
              : "Ingen"
          }
          sub={
            props.nextTournament
              ? `om ${props.nextTournament.daysAway} dg`
              : "ingen påmeldt"
          }
          icon={Trophy}
        />

        {/* Tester */}
        <KpiTile
          eyebrow="Tester"
          value={`${props.testerDone}/${props.testerTotal}`}
          sub={`${Math.round((props.testerDone / Math.max(1, props.testerTotal)) * 100)} %`}
        />

        {/* HCP-trend */}
        <KpiTile
          eyebrow="HCP-trend"
          value={props.hcpString}
          sub={props.hcpTrendDelta}
          icon={TrendingDown}
          accent
        />
      </section>

      {/* Dagens fokus-card (lime accent venstre) */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6"
      >
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-1.5"
          style={{ background: "#D1F843" }}
        />
        <div className="pl-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
                Dagens fokus
              </div>
              <h2 className="mt-1 font-display text-xl font-semibold leading-snug text-[#0A1F17]">
                Du har{" "}
                <em
                  className="font-normal not-italic"
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontStyle: "italic",
                    color: "#005840",
                  }}
                >
                  {props.todaysFocus.length}
                </em>{" "}
                ting i dag
              </h2>
            </div>
          </div>

          {props.todaysFocus.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-[#E5E3DD] bg-[#FAFAF7] p-4 text-sm text-[#5E5C57]">
              Ingenting planlagt i dag. Bra dag for å logge en runde.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#E5E3DD]">
              {props.todaysFocus.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="w-14 shrink-0 font-mono text-sm font-semibold tabular-nums text-[#0A1F17]">
                    {item.time}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#0A1F17]">
                      {item.title}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                      {item.durMin} min · {item.location}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Pyramide-uke-strip */}
      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
              Pyramide · denne uka
            </div>
            <h2 className="mt-1 font-display text-base font-semibold text-[#0A1F17]">
              Drill-fordeling per dag
            </h2>
          </div>
          <Link
            href="/portal/planlegge"
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#005840] hover:underline"
          >
            Hele uka →
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {props.pyramideWeek.map((d, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-2 rounded-xl border p-2 sm:p-3 ${
                d.isToday
                  ? "border-[#D1F843] bg-[#D1F843]/10"
                  : "border-[#E5E3DD] bg-[#FAFAF7]"
              }`}
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5E5C57]">
                {d.day}
              </span>
              <div className="flex h-12 items-end gap-0.5">
                {d.drills.length === 0 ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#E5E3DD]" />
                ) : (
                  d.drills.map((dr, j) => (
                    <div
                      key={j}
                      className="w-1.5 rounded-full"
                      style={{
                        height: `${Math.min(48, 8 + dr.count * 8)}px`,
                        background: PYR_COLOR[dr.area] ?? "#5E5C57",
                      }}
                      title={`${dr.area} · ${dr.count}`}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
          {(["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((a) => (
            <span key={a} className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: PYR_COLOR[a] }}
              />
              {a}
            </span>
          ))}
        </div>
      </section>

      {/* Coach-ping-banner (kun hvis ulest melding) */}
      {props.coachPing && (
        <section
          className="relative overflow-hidden rounded-2xl border border-[#D1F843] bg-[#D1F843]/15 p-5"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#005840] text-[#D1F843]">
              <MessageSquare size={18} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#005840]">
                {props.coachPing.coachName} skrev
              </div>
              <p className="mt-1 truncate text-sm font-medium text-[#0A1F17]">
                &laquo;{props.coachPing.text}&raquo;
              </p>
            </div>
            <Link
              href={props.coachPing.href}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#005840] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#D1F843] hover:opacity-90"
            >
              Svar
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
        </section>
      )}

      {/* 2-kol hovedinnhold */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Venstre kol */}
        <div className="space-y-4">
          {/* Aktiv plan */}
          <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
                Aktiv plan
              </div>
              <Link
                href={props.activePlan?.href ?? "/portal/planlegge"}
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#005840] hover:underline"
              >
                Åpne plan →
              </Link>
            </div>
            {props.activePlan ? (
              <>
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-[#0A1F17]">
                  <em
                    className="font-normal not-italic"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontStyle: "italic",
                      color: "#005840",
                    }}
                  >
                    {props.activePlan.name}
                  </em>
                </h3>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                    <span>
                      {props.activePlan.done}/{props.activePlan.total} økter
                    </span>
                    <span>
                      {Math.round(
                        (props.activePlan.done /
                          Math.max(1, props.activePlan.total)) *
                          100,
                      )}{" "}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F1EEE5]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          (props.activePlan.done /
                            Math.max(1, props.activePlan.total)) *
                            100,
                        )}%`,
                        background:
                          "linear-gradient(90deg, #005840 0%, #1A7D56 100%)",
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-3 rounded-md border border-dashed border-[#E5E3DD] p-4 text-sm text-[#5E5C57]">
                Ingen aktiv plan. Be coach om å sette en.
              </p>
            )}
          </section>

          {/* Neste milepæl */}
          <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
                Neste milepæl
              </div>
              <Trophy size={14} strokeWidth={1.5} className="text-[#5E5C57]" />
            </div>
            {props.nextMilestone ? (
              <>
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-[#0A1F17]">
                  {props.nextMilestone.title}
                </h3>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-mono text-[44px] font-semibold leading-none tabular-nums text-[#005840]">
                      {props.nextMilestone.daysLeft}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                      dager igjen
                    </div>
                  </div>
                  <Sparkline points={props.nextMilestone.sparkline} />
                </div>
              </>
            ) : (
              <p className="mt-3 rounded-md border border-dashed border-[#E5E3DD] p-4 text-sm text-[#5E5C57]">
                Ingen aktiv milepæl satt.
              </p>
            )}
          </section>
        </div>

        {/* Høyre kol — aktivitet-feed */}
        <aside className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
            Aktivitet
          </div>
          <h3 className="mt-1 font-display text-base font-semibold text-[#0A1F17]">
            Siste hendelser
          </h3>
          {props.activityFeed.length === 0 ? (
            <p className="mt-4 text-sm text-[#5E5C57]">
              Ingen aktivitet ennå.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {props.activityFeed.slice(0, 5).map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-start gap-3 border-b border-[#E5E3DD] pb-3 last:border-b-0 last:pb-0"
                >
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background:
                        ev.type === "okt"
                          ? "#005840"
                          : ev.type === "test"
                            ? "#D1F843"
                            : ev.type === "runde"
                              ? "#B8852A"
                              : "#5E5C57",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#0A1F17]">
                      {ev.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                      {ev.timeAgo}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {/* Bunn-CTA-bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <Link
          href="/portal/gjennomfore?tab=idag"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D1F843] px-6 py-4 font-display text-base font-semibold text-[#0A1F17] transition-colors hover:bg-[#BFE933]"
        >
          <Play size={18} strokeWidth={2} />
          Start dagens økt
        </Link>
        <Link
          href="/portal/ny-okt"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#005840] bg-transparent px-6 py-4 font-medium text-[#005840] transition-colors hover:bg-[#005840] hover:text-white"
        >
          <PlusCircle size={16} strokeWidth={1.75} />
          Ny økt fra plan
        </Link>
      </div>
    </div>
  );
}

function KpiTile({
  eyebrow,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  eyebrow: string;
  value: string;
  sub: string;
  icon?: typeof Trophy;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E3DD] bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
          {eyebrow}
        </span>
        {Icon && (
          <Icon size={14} strokeWidth={1.75} className="text-[#5E5C57]" />
        )}
      </div>
      <div
        className={`mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums ${
          accent ? "text-[#005840]" : "text-[#0A1F17]"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
        {sub}
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length === 0) {
    return null;
  }
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(0.01, max - min);
  const w = 96;
  const h = 32;
  const step = w / Math.max(1, points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="#005840"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
