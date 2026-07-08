/**
 * AgencyOS — Bookinger & kapasitet (GJENNOMFØRE), /admin/bookinger.
 *
 * Kombinert dashbord (sammenslåing av tidligere /admin/bookinger + /admin/kapasitet,
 * Anders' beslutning 2026-06-22). Port av fasit
 * `AgencyOS Bookinger og kapasitet (terminal).dc.html` (mørkt tema, desktop 1280):
 *   - PageHead: eyebrow «UKE N · {LOKASJON}» + tittel «Bookinger & kapasitet»
 *     (kapasitet i kursiv) + «Ny booking»- og «Eksporter»-handlinger.
 *   - 4 KPI-kort: BOOKINGER UKE · KAPASITET BRUKT % · LEDIGE LUKER · FORESPØRSLER.
 *   - VENSTRE: kapasitet-heatmap (timer × dag), lime = fullt belegg.
 *   - HØYRE: booking-liste TID/SPILLER/TYPE/ANLEGG/STATUS med bekreft/avvis i raden.
 *
 * Datakilder (alt ekte): prisma.booking + prisma.facility for inneværende uke
 * (man–søn), prisma.sessionRequest (PENDING) for forespørsler. «Ny booking» lenker
 * til eksisterende wizard /admin/bookinger/ny. Status-mapping: PENDING=Forespørsel ·
 * CONFIRMED=Bekreftet · CANCELLED=Avlyst · COMPLETED=Fullført.
 */

import Link from "next/link";
import { Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  AgChip,
  AgPage,
  AgPageHead,
  AgPlayerCell,
  agBtnClass,
} from "@/components/admin/agencyos/ui";
import { BekreftAvvis } from "./bekreft-avvis";
import { EksporterKnapp } from "./eksporter-knapp";
import { WeekCalendar, type WeekEvent, type WeekEventKind } from "@/components/admin/kalender/week-calendar";
import { MonthCalendar, type MonthEvent, type MonthEventKind, type MonthDay } from "@/components/admin/kalender/month-calendar";

export const dynamic = "force-dynamic";

const DAGER_KORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"]; // getDay()-indeks
const DAG_KOLONNER = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"]; // heatmap-kolonner (mandag først)

// Åpningstimene heatmapen dekker (06:00–22:00). Bruker både til celle-indeks og eksport.
const TIMER = [
  "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22",
];

function mandagFor(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function isoUke(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - aarStart.getTime()) / 86_400_000 + 1) / 7);
}

function tidLabel(d: Date): string {
  const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${DAGER_KORT[d.getDay()]} ${d.getDate()}. · ${hhmm}`;
}

function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/);
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

const STATUS: Record<string, { label: string; tone: "ok" | "warn" | "neu" }> = {
  PENDING: { label: "Forespørsel", tone: "warn" },
  CONFIRMED: { label: "Bekreftet", tone: "ok" },
  CANCELLED: { label: "Avlyst", tone: "neu" },
  COMPLETED: { label: "Fullført", tone: "neu" },
};

/** mandag-først kolonneindeks (0=Ma … 6=Sø) fra getDay() (0=Søn). */
function kolonneFor(getDay: number): number {
  return (getDay + 6) % 7;
}

type HeatLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Belegg-% → token-basert utility (accent/lime-rampe; FULL = LIME). */
function heatClass(level: HeatLevel): string {
  if (level === 0) return "bg-secondary";
  if (level === 1) return "bg-accent/20";
  if (level === 2) return "bg-accent/40";
  if (level === 3) return "bg-accent/60";
  if (level === 4) return "bg-accent/80";
  return "bg-accent";
}

function toHeatLevel(pct: number): HeatLevel {
  if (pct === 0) return 0;
  if (pct < 25) return 1;
  if (pct < 50) return 2;
  if (pct < 75) return 3;
  if (pct < 95) return 4;
  return 5;
}

export default async function BookingerPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { tab = "oversikt" } = await searchParams;

  const ukeStart = mandagFor(new Date());
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const ukeNr = isoUke(ukeStart);

  const [bookinger, facilities, ventendeForesporsler] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: ukeStart, lt: ukeSlutt } },
      orderBy: { startAt: "asc" },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true,
            technicalPlans: {
              where: { status: "ACTIVE" },
              select: { id: true },
              take: 1
            }
          } 
        },
        serviceType: { select: { name: true } },
        facility: { select: { name: true } },
        location: { select: { name: true } },
      },
    }),
    prisma.facility.findMany({
      where: { active: true },
      include: { location: { select: { name: true } } },
      orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.sessionRequest.count({ where: { status: "PENDING" } }),
  ]);

  // --- Kapasitet-heatmap: timer × dag (ekte bookinger) ---
  // Hver celle = belegg den timen den ukedagen, relativt til samlet fasilitets-
  // kapasitet (sum capacity over aktive fasiliteter). 1 fasilitets-slot per time/dag.
  const samletKapasitet = facilities.reduce((sum, f) => sum + Math.max(1, f.capacity), 0) || 1;

  // counts[timeIdx][dagIdx] = antall opptatte slots
  const counts: number[][] = TIMER.map(() => new Array(7).fill(0));
  const aktiveBookinger = bookinger.filter(
    (b) => b.status === "CONFIRMED" || b.status === "PENDING",
  );
  for (const b of aktiveBookinger) {
    const timeIdx = TIMER.findIndex((t) => Number(t) === b.startAt.getHours());
    if (timeIdx === -1) continue;
    const dagIdx = kolonneFor(b.startAt.getDay());
    counts[timeIdx][dagIdx]++;
  }

  // Belegg-% per celle (kappet til 100), og samlet utnyttelse for KPI-ene.
  const heatRader = TIMER.map((time, ti) => ({
    time,
    pcts: counts[ti].map((c) => Math.min(100, Math.round((c / samletKapasitet) * 100))),
  }));

  const totaltSlots = TIMER.length * 7 * samletKapasitet;
  const brukteSlots = counts.reduce(
    (sum, row) => sum + row.reduce((a, c) => a + Math.min(c, samletKapasitet), 0),
    0,
  );
  const kapasitetBruktPct = totaltSlots ? Math.round((brukteSlots / totaltSlots) * 100) : 0;
  const ledigeLuker = Math.max(0, totaltSlots - brukteSlots);

  const ventendeBookinger = bookinger.filter((b) => b.status === "PENDING").length;
  const foresporsler = ventendeBookinger + ventendeForesporsler;

  const lokasjon = facilities[0]?.location.name ?? "Alle anlegg";

  // Eksport-rader (timer × dag) for CSV-knappen.
  const eksportRader = heatRader.map((r) => ({
    fasilitet: `Kl ${r.time}:00`,
    lokasjon,
    pcts: r.pcts,
    snitt: Math.round(r.pcts.reduce((a, p) => a + p, 0) / r.pcts.length),
  }));

  return (
    <AgPage>
      <AgPageHead
        eyebrow={`Uke ${ukeNr} · ${lokasjon}`}
        title="Bookinger &"
        italic="kapasitet"
        actions={
          <>
            <EksporterKnapp rader={eksportRader} timer={TIMER} ukeNr={ukeNr} />
            <Link href="/admin/bookinger/ny" className={agBtnClass("primary")}>
              <Plus size={16} strokeWidth={1.5} /> Ny booking
            </Link>
            <Link href="#bulk" className={agBtnClass("secondary")}>Bulk handlinger</Link>
          </>
        }
      />

      {/* Tabs for admin hub */}
      <div className="flex gap-2 mb-4 border-b border-border">
        <Link href="/admin/bookinger" className="px-4 py-2 text-sm font-medium border-b-2 border-primary">Oversikt</Link>
        <Link href="/admin/availability" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Kapasitet</Link>
        <Link href="/admin/bookinger?tab=kalender" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Kalender</Link>
      </div>

      {tab === "kalender" && (
        <div className="mb-4 space-y-4">
          <div className="p-4 border border-border rounded bg-card">
            <h3 className="font-semibold mb-2">Uke + Måned kalender — Full komponenter</h3>
            <p className="text-sm text-muted-foreground mb-2">Produsert med offisiell WeekCalendar + MonthCalendar fra components/admin/kalender (samme som /admin/kalender). Data mappet fra ekte bookinger.</p>

            {/* Full WeekCalendar integrert */}
            {(() => {
              const weekEvents: WeekEvent[] = bookinger
                .filter(b => ["CONFIRMED","PENDING"].includes(b.status))
                .slice(0, 25)
                .map((b) => {
                  const dayIndex = (b.startAt.getDay() + 6) % 7;
                  const startMin = b.startAt.getHours() * 60 + b.startAt.getMinutes();
                  const dur = b.endAt ? Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60000) : 60;
                  const endMin = startMin + dur;
                  const kind: WeekEventKind = (b.serviceType?.name || "").toLowerCase().includes("gruppe") ? "group" : "oneToOne";
                  return {
                    id: b.id,
                    dayIndex,
                    startMin,
                    endMin,
                    timeLabel: `${String(b.startAt.getHours()).padStart(2,"0")}:${String(b.startAt.getMinutes()).padStart(2,"0")}`,
                    title: (b.user?.name || b.guestName || "Gjest").slice(0, 20),
                    serviceLabel: b.serviceType?.name || "Booking",
                    location: b.location?.name || b.facility?.name || null,
                    kind,
                    isCompleted: b.status === "COMPLETED",
                    href: `/admin/bookinger`,
                  } as WeekEvent;
                });

              const now = new Date();
              const days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - ((now.getDay() + 6) % 7) + i);
                return {
                  dow: ["Man","Tir","Ons","Tor","Fre","Lør","Søn"][i],
                  date: d.getDate(),
                  month: String(d.getMonth() + 1).padStart(2, "0"),
                  weekend: i >= 5,
                  isToday: d.toDateString() === now.toDateString(),
                };
              });

              const weekProps = {
                weekNumber: Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7),
                rangeLabel: "Nåværende uke",
                isCurrentWeek: true,
                prevWeekParam: "",
                nextWeekParam: "",
                todayParam: "",
                nowMinutes: now.getHours() * 60 + now.getMinutes(),
                nowDayIndex: (now.getDay() + 6) % 7,
                days,
                events: weekEvents,
                bookingCount: weekEvents.length,
              };

              return <div className="rounded overflow-hidden border border-border"><WeekCalendar {...weekProps} /></div>;
            })()}

            <div className="mt-3 text-[10px] text-muted-foreground">Også MonthCalendar nedenfor. Gå til <Link href="/admin/kalender" className="underline text-primary">/admin/kalender</Link> for full interaktiv visning + toggle.</div>
          </div>

          {/* Full MonthCalendar */}
          <div className="p-4 border border-border rounded bg-card">
            <h4 className="font-semibold mb-2">Måned (MonthCalendar)</h4>
            {(() => {
              const monthEvents: MonthEvent[] = bookinger.slice(0, 12).map((b) => ({
                id: b.id,
                dateKey: b.startAt.toISOString().slice(0, 10),
                timeLabel: b.startAt.toTimeString().slice(0, 5),
                title: (b.user?.name || b.guestName || "Gjest").slice(0, 16),
                kind: "oneToOne" as MonthEventKind,
                isCompleted: b.status === "COMPLETED",
                href: "/admin/bookinger",
              }));

              const today = new Date();
              const first = new Date(today.getFullYear(), today.getMonth(), 1);
              const startOffset = (first.getDay() + 6) % 7;
              const days: MonthDay[] = Array.from({ length: 42 }, (_, i) => {
                const d = new Date(first);
                d.setDate(1 + i - startOffset);
                return {
                  dateKey: d.toISOString().slice(0, 10),
                  date: d.getDate(),
                  inMonth: d.getMonth() === today.getMonth(),
                  weekend: [0, 6].includes(d.getDay()),
                  isToday: d.toDateString() === today.toDateString(),
                };
              });

              return (
                <MonthCalendar
                  monthLabel={today.toLocaleString("nb-NO", { month: "long", year: "numeric" })}
                  prevMonthParam=""
                  nextMonthParam=""
                  todayParam=""
                  isCurrentMonth
                  days={days}
                  events={monthEvents}
                  bookingCount={monthEvents.length}
                  spillerCount={0}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Rapporter (step 6) + Coach filter */}
      <div className="mb-4 p-4 border border-border rounded bg-card">
        <h3 className="font-semibold mb-2">Rapporter</h3>
        <p className="text-sm">Utnyttelse: {kapasitetBruktPct}% | Ledige luker: {ledigeLuker} | Forespørsler: {foresporsler}</p>
        <div className="mt-1 text-xs text-muted-foreground">
          Per anlegg: {facilities.slice(0,3).map(f => f.name).join(", ")}{facilities.length > 3 ? "..." : ""}. 
          Coach-filter og mer granularitet i Kapasitet / spillere. Drag i availability for å justere kapasitet.
          (For coach-spesifikk: filtrer i availability + se per spiller planer.)
        </div>

        {/* Enkel coach filter UI (produsert) */}
        <div className="mt-3 text-xs">
          <span className="font-mono uppercase tracking-widest text-muted-foreground">Coach filter:</span>{" "}
          <Link href="/admin/bookinger" className="underline">Alle</Link> ·{" "}
          <Link href="/admin/availability" className="underline">Filtrer i availability</Link>
          <span className="ml-2 text-muted-foreground">(utvid med query på coachId i booking når modell støtter)</span>
        </div>
      </div>

      {/* Bulk actions */}
      <div id="bulk" className="mb-4 flex gap-2 flex-wrap">
        <form action={async () => {
          "use server";
          const { bekreftAllePending } = await import("./actions");
          await bekreftAllePending();
        }}>
          <button type="submit" className={agBtnClass("secondary")}>
            Bekreft alle PENDING (bulk)
          </button>
        </form>
        <form action={async () => {
          "use server";
          const { avvisAllePending } = await import("./actions");
          await avvisAllePending();
        }}>
          <button type="submit" className={agBtnClass("secondary")}>
            Avvis alle PENDING (bulk)
          </button>
        </form>
        <form action={async () => {
          "use server";
          const { markerAlleConfirmedSomCompleted } = await import("./actions");
          await markerAlleConfirmedSomCompleted();
        }}>
          <button type="submit" className={agBtnClass("secondary")}>
            Marker alle CONFIRMED som COMPLETED (bulk)
          </button>
        </form>
      </div>

      {/* KPI-kort */}
      <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-4">
        <Kpi label="Bookinger uke" value={String(bookinger.length)} />
        <Kpi label="Kapasitet brukt" value={`${kapasitetBruktPct} %`} tone="lime" />
        <Kpi label="Ledige luker" value={String(ledigeLuker)} />
        <Kpi label="Forespørsler" value={String(foresporsler)} tone="warn" last />
      </div>

      {/* 2-kolonne: heatmap (venstre) + liste (høyre) */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_1.2fr]">
        {/* Kapasitet-heatmap — timer × dag */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
              Kapasitet · timer × dag
            </span>
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-primary">
              Full = lime
            </span>
          </div>

          {facilities.length === 0 ? (
            <div className="flex items-center justify-center rounded-md border border-dashed border-border p-10 text-[13px] text-muted-foreground">
              Ingen aktive fasiliteter. Legg til via /admin/anlegg.
            </div>
          ) : (
            <div
              className="grid gap-[5px]"
              style={{ gridTemplateColumns: "34px repeat(7, minmax(0, 1fr))" }}
            >
              <span />
              {DAG_KOLONNER.map((d) => (
                <span
                  key={d}
                  className="text-center font-mono text-[8.5px] font-semibold text-muted-foreground"
                >
                  {d}
                </span>
              ))}
              {heatRader.map((r) => (
                <HeatRad key={r.time} time={r.time} pcts={r.pcts} />
              ))}
            </div>
          )}
        </section>

        {/* Booking-liste */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            className="grid gap-3 border-b border-border bg-secondary/40 px-4 py-[11px]"
            style={{ gridTemplateColumns: "64px 1.6fr 1.2fr 1fr 0.8fr 0.9fr" }}
          >
            {["Tid", "Spiller", "Type", "Anlegg", "Plan", "Status"].map((h) => (
              <span
                key={h}
                className="font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground"
              >
                {h}
              </span>
            ))}
          </div>

          {bookinger.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13px] text-muted-foreground">
              Ingen bookinger denne uka.
            </div>
          ) : (
            bookinger.map((b) => {
              const navn = b.user?.name ?? b.guestName ?? "Gjest";
              const status = STATUS[b.status] ?? { label: b.status, tone: "neu" as const };
              const anlegg = b.facility?.name ?? b.location?.name ?? "—";
              return (
                <div
                  key={b.id}
                  className="grid items-center gap-3 border-b border-border px-4 py-[13px] transition-colors last:border-b-0 hover:bg-secondary"
                  style={{ gridTemplateColumns: "64px 1.6fr 1.2fr 1fr 0.8fr 0.9fr" }}
                >
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {tidLabel(b.startAt)}
                  </span>
                  <AgPlayerCell initials={initialer(navn)} name={navn} size={26} />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {b.serviceType.name}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{anlegg}</span>
                  {b.user?.technicalPlans?.length ? (
                    <Link href={`/admin/spillere/${b.user.id}/plan/${b.user.technicalPlans[0].id}`} className="text-xs text-primary underline">
                      Se plan
                    </Link>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                  {b.status === "PENDING" ? (
                    <BekreftAvvis bookingId={b.id} />
                  ) : (
                    <AgChip tone={status.tone} className="justify-self-start">
                      {status.label}
                    </AgChip>
                  )}
                </div>
              );
            })
          )}
        </section>
      </div>
    </AgPage>
  );
}

function HeatRad({ time, pcts }: { time: string; pcts: number[] }) {
  return (
    <>
      <span className="flex items-center font-mono text-[8.5px] text-muted-foreground">
        {time}
      </span>
      {pcts.map((p, i) => (
        <span
          key={i}
          className={`grid aspect-square place-items-center rounded-[4px] font-mono text-[8px] tabular-nums transition-shadow hover:ring-2 hover:ring-foreground ${heatClass(
            toHeatLevel(p),
          )} ${p >= 95 ? "text-accent-foreground" : "text-foreground/70"}`}
          title={`${DAG_KOLONNER[i]} kl ${time}:00 · ${p}% belegg`}
        >
          {p === 0 ? "" : p}
        </span>
      ))}
    </>
  );
}

function Kpi({
  label,
  value,
  tone,
  last,
}: {
  label: string;
  value: string;
  tone?: "lime" | "warn";
  last?: boolean;
}) {
  return (
    <div className={`px-4 py-[14px] ${last ? "" : "border-r border-border"}`}>
      <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-2xl font-semibold leading-none tabular-nums ${
          tone === "lime"
            ? "text-primary"
            : tone === "warn"
              ? "text-warning"
              : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
