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

export default async function BookingerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const ukeStart = mandagFor(new Date());
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const ukeNr = isoUke(ukeStart);

  const [bookinger, facilities, ventendeForesporsler] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: ukeStart, lt: ukeSlutt } },
      orderBy: { startAt: "asc" },
      include: {
        user: { select: { id: true, name: true } },
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
          </>
        }
      />

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
            style={{ gridTemplateColumns: "64px 1.6fr 1.2fr 1fr 0.9fr" }}
          >
            {["Tid", "Spiller", "Type", "Anlegg", "Status"].map((h) => (
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
                  style={{ gridTemplateColumns: "64px 1.6fr 1.2fr 1fr 0.9fr" }}
                >
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {tidLabel(b.startAt)}
                  </span>
                  <AgPlayerCell initials={initialer(navn)} name={navn} size={26} />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {b.serviceType.name}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{anlegg}</span>
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
