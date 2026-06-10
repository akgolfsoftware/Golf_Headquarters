import Link from "next/link";
import { Download, Grid3X3, Lightbulb } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";

export const dynamic = "force-dynamic";

type CellLevel = 0 | 1 | 2 | 3 | 4 | 5 | "blocked";

function levelClass(level: CellLevel): string {
  if (level === "blocked")
    return "bg-[repeating-linear-gradient(135deg,var(--muted)_0_4px,var(--card)_4px_8px)] text-muted-foreground";
  if (level === 0) return "bg-secondary text-muted-foreground";
  if (level === 1) return "bg-accent/15 text-foreground";
  if (level === 2) return "bg-accent/35 text-foreground";
  if (level === 3) return "bg-accent/60 text-foreground";
  if (level === 4) return "bg-accent text-accent-foreground font-semibold";
  return "bg-primary text-primary-foreground font-semibold";
}

function toLevel(pct: number): CellLevel {
  if (pct === 0) return 0;
  if (pct < 25) return 1;
  if (pct < 50) return 2;
  if (pct < 75) return 3;
  if (pct < 95) return 4;
  return 5;
}

function ukeStart(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const day = c.getDay();
  const diff = (day + 6) % 7;
  c.setDate(c.getDate() - diff);
  return c;
}

const TIMER = [
  "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22",
];

export default async function KapasitetPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const idag = new Date();
  const fra = ukeStart(idag);
  const til = new Date(fra);
  til.setDate(fra.getDate() + 7);

  const [facilities, bookinger] = await Promise.all([
    prisma.facility.findMany({
      where: { active: true },
      include: { location: { select: { name: true } } },
      orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.booking.findMany({
      where: {
        startAt: { gte: fra, lt: til },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      select: { startAt: true, endAt: true, locationId: true },
    }),
  ]);

  // Beregn belegg per fasilitet × time
  // Vi bruker locationId siden Booking ikke har facilityId direkte
  const beleggMap = new Map<string, number[]>();
  for (const f of facilities) {
    beleggMap.set(f.id, new Array(TIMER.length).fill(0));
  }

  // Antall timer-slots per uke (7 dager × 1 facility)
  const SLOTS_PER_UKE = 7;

  for (const b of bookinger) {
    const startTime = b.startAt.getHours();
    const idx = TIMER.findIndex((t) => Number(t) === startTime);
    if (idx === -1) continue;
    // Map til fasiliteter på samme lokasjon (forenklet — bruker locationId)
    const facsAtLoc = facilities.filter((f) => f.locationId === b.locationId);
    if (facsAtLoc.length === 0) continue;
    const f0 = facsAtLoc[0];
    const arr = beleggMap.get(f0.id);
    if (arr) arr[idx]++;
  }

  // Konverter til prosent
  const rader = facilities.map((f) => {
    const counts = beleggMap.get(f.id) ?? new Array(TIMER.length).fill(0);
    const pcts = counts.map((c) =>
      Math.min(100, Math.round((c / SLOTS_PER_UKE) * 100)),
    );
    const snitt = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    return { f, pcts, snitt };
  });

  const snittBelegg = rader.length
    ? Math.round(rader.reduce((a, r) => a + r.snitt, 0) / rader.length)
    : 0;

  let overbookede = 0;
  let underbookede = 0;
  for (const r of rader) {
    for (const p of r.pcts) {
      if (p >= 95) overbookede++;
      else if (p < 20 && p > 0) underbookede++;
    }
  }

  const ukeNr = (() => {
    const d = new Date(
      Date.UTC(idag.getFullYear(), idag.getMonth(), idag.getDate()),
    );
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`AgencyOS · Kapasitet · uke ${ukeNr}`}
        titleLead="Kapasitet"
        titleItalic="· denne uka"
        sub="Belegg per fasilitet × time, lokasjons-aggregert."
        actions={
          <>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground opacity-50"
            >
              <Download className="h-4 w-4" />
              Eksporter
            </button>
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
            >
              <Grid3X3 className="h-4 w-4" />
              Bulk-blokker
            </button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Kpi
          label="Snitt-belegg · denne uka"
          value={String(snittBelegg)}
          unit="%"
        />
        <Kpi
          label="Overbookede slots"
          value={String(overbookede)}
          foot="> 95 % belegg · risiko"
          valueTone="primary"
        />
        <Kpi
          label="Underbookede"
          value={String(underbookede)}
          foot="< 20 % belegg · selg disse"
        />
        <Kpi
          label="Fasiliteter aktive"
          value={String(facilities.length)}
          foot={`${bookinger.length} bookinger denne uka`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Heatmap */}
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-[20px] font-semibold tracking-tight">
                Belegg per fasilitet × time
              </h2>
              <div className="mt-1 text-[12px] text-muted-foreground">
                Uke {ukeNr} · {TIMER.length} timer × {rader.length} fasiliteter
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>0 %</span>
              <div className="flex h-3.5 items-center gap-0.5">
                <span className="block h-3.5 w-4 rounded-sm bg-secondary" />
                <span className="block h-3.5 w-4 rounded-sm bg-accent/15" />
                <span className="block h-3.5 w-4 rounded-sm bg-accent/35" />
                <span className="block h-3.5 w-4 rounded-sm bg-accent/60" />
                <span className="block h-3.5 w-4 rounded-sm bg-accent" />
                <span className="block h-3.5 w-4 rounded-sm bg-primary" />
              </div>
              <span>100 %</span>
            </div>
          </div>

          {rader.length === 0 ? (
            <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-card/40 p-12 text-[13px] text-muted-foreground">
              Ingen aktive fasiliteter. Legg til via /admin/anlegg.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `132px repeat(${TIMER.length}, minmax(28px, 1fr)) 64px`,
                }}
              >
                <div />
                {TIMER.map((t) => (
                  <div
                    key={t}
                    className="py-1 text-center font-mono text-[10px] font-medium text-muted-foreground"
                  >
                    {t}
                  </div>
                ))}
                <div className="py-1 text-center font-mono text-[10px] font-medium text-muted-foreground">
                  Snitt
                </div>

                {rader.map((r) => (
                  <RadenInner key={r.f.id} rad={r} />
                ))}
              </div>
              <div className="mt-4 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Time (06:00 – 22:00)
              </div>
            </div>
          )}
        </section>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Topp 3 mest brukte tider
            </div>
            {[...rader]
              .flatMap((r) =>
                r.pcts.map((p, i) => ({
                  rad: r.f.name,
                  loc: r.f.location.name,
                  time: TIMER[i],
                  pct: p,
                })),
              )
              .sort((a, b) => b.pct - a.pct)
              .slice(0, 3)
              .map((it, i) => (
                <div
                  key={`${it.rad}-${it.time}`}
                  className="grid grid-cols-[24px_1fr_auto] items-center gap-2.5 border-t border-border py-2.5 first:border-t-0"
                >
                  <div className="font-mono text-[12px] font-semibold text-muted-foreground">
                    {i + 1}
                  </div>
                  <div className="text-[13px] text-foreground">
                    {it.rad} · {it.time}:00
                    <span className="block text-[11px] text-muted-foreground">
                      {it.loc}
                    </span>
                  </div>
                  <div className="font-mono text-[13px] font-semibold text-foreground">
                    {it.pct} %
                  </div>
                </div>
              ))}
          </div>

          <div className="flex flex-col gap-2.5 rounded-lg border border-accent/30 bg-accent/10 p-4">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
              <Lightbulb className="h-3.5 w-3.5" />
              Foreslått tiltak
            </div>
            <h4 className="font-display text-[15px] font-semibold leading-snug text-foreground">
              Identifiser de minst brukte tidene og senk prisen 10–15 % for å løfte belegg.
            </h4>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              Når heatmap-data er rikere kan agenten foreslå konkrete pristiltak per fasilitet × tidssone.
            </p>
            <div className="flex gap-2">
              <Link
                href="/admin/services"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90"
              >
                Til tjenester
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <footer className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-border pt-4 text-[12px] text-muted-foreground sm:flex-row sm:items-center">
        <span>AK Golf Platform · AgencyOS · /admin/kapasitet</span>
        <span className="font-mono">
          Uke {ukeNr}/52 · {bookinger.length} bookinger denne uka
        </span>
      </footer>
    </div>
  );
}

function RadenInner({
  rad,
}: {
  rad: {
    f: { id: string; name: string; location: { name: string } };
    pcts: number[];
    snitt: number;
  };
}) {
  return (
    <>
      <div className="flex flex-col justify-center px-1 py-2 text-[13px] font-medium text-foreground">
        {rad.f.name}
        <span className="font-mono text-[10.5px] font-normal text-muted-foreground">
          {rad.f.location.name}
        </span>
      </div>
      {rad.pcts.map((p, i) => {
        const lvl = toLevel(p);
        return (
          <div
            key={i}
            className={`aspect-square rounded-sm font-mono text-[10px] tabular-nums grid place-items-center transition-shadow hover:ring-2 hover:ring-foreground ${levelClass(lvl)}`}
            title={`${rad.f.name} · kl ${TIMER[i]}:00 · ${p}%`}
          >
            {p === 0 ? "—" : p}
          </div>
        );
      })}
      <div className="grid place-items-center rounded-sm bg-secondary font-mono text-[12px] font-semibold text-foreground">
        {rad.snitt}%
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  unit,
  foot,
  valueTone,
}: {
  label: string;
  value: string;
  unit?: string;
  foot?: string;
  valueTone?: "primary";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] font-medium text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[32px] font-medium leading-none tracking-tight tabular-nums ${
          valueTone === "primary" ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <span className="text-[14px] font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {foot && (
        <div className="mt-4 text-[12px] text-muted-foreground">{foot}</div>
      )}
    </div>
  );
}
